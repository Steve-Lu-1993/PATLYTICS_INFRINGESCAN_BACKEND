import axios from "axios";
require("dotenv").config();

const API_KEY = process.env.OPENAI_LLM_API_KEY;
const BASE_URL = "https://api.openai.com/v1/chat/completions";

export class OpenAiLMService {
  private extractMultiPartJSON(text:string) {
    const jsonRegex = /```json([\s\S]*?)```/g;
    const matches = [...text.matchAll(jsonRegex)];
    return matches
      .map((match) => {
        try {
          return JSON.parse(match[1].trim());
        } catch (error) {
          console.error("JSON parsing error:", error);
          return null;
        }
      })
      .filter((json) => json !== null);
  }

  private extractFirstJSON(text:string) {
    const jsonRegex = /```json([\s\S]*?)```/;
    const match = text.match(jsonRegex);
    
    if (match) {
        try {
            return JSON.parse(match[1].trim());
        } catch (error) {
            console.error("JSON parsing error:", error);
            return null;
        }
    } else {
        console.log("No JSON found in the text.");
        return null;
    }
}

  public async getComparisonResult(
    patent_description: string,
    company_products: { id: number; name: string; description: string }[],
    model: string = "gpt-4o-mini"
  ): Promise<any[]> {
    const prompt = `Analyze the provided company product list for potential patent infringement and return result with array object in json format,
                    each object like {"id":1,"name":"Product One","description":"some product description","infringement_reason":"some reason"}\n\n
                    *if product doesn't potentially infringe the patent, don't list the product in result.\n\n
                    ##ProductList\n\n${JSON.stringify(company_products)}\n\n
                    ##PatentDescription\n\n${patent_description}`;

    console.log("Prompt:", prompt);

    const requestBody = {
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a patent attorney reviewing a list of company products for potential patent infringement.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      top_p: 0.95,
      n: 1,
    };

    try {
      const response = await axios.post(BASE_URL, requestBody, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
      });

      if (
        response.data &&
        response.data.choices &&
        response.data.choices.length > 0
      ) {
        const summary = response.data.choices[0].message.content.trim();
        const results = this.extractFirstJSON(summary);

        return results;
      } else {
        throw new Error("generate_summary_failed");
      }
    } catch (error: any) {
      console.error( "generate_summary_error", error.response ? error.response.data : error.message );
      throw error;
    }
  }
}
