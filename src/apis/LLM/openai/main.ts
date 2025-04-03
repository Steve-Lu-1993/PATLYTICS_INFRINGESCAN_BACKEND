import axios from "axios";
import { ServiceRes } from "../../../types/GenericTypes";
import dotenv from "dotenv";
import { Patent } from "../../../entities/Patent";

dotenv.config();

const API_KEY = process.env.OPENAI_LLM_API_KEY;
const BASE_URL = "https://api.openai.com/v1/chat/completions";

export class OpenAiLMService {
  private extractMultiPartJSON(text: string) {
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

  private extractFirstJSON(text: string) {
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
    patent: Patent,
    company_products: { id: number; name: string; description: string }[],
    model: string = "gpt-4o-mini"
  ): Promise<ServiceRes<any[]>> {
    const prompt = `Analyze the provided company products for potential patent infringement against the given patent information.

## Patent Information
Patent Number: ${patent.publication_number}
Title: ${patent.title}
Abstract: ${patent.abstract}
Classifications: ${JSON.stringify(patent.classifications || {})}

## Patent Claims
${JSON.stringify(patent.claims || [])}

## Patent Description Summary
${patent.description?.substring(0, 2000) || ""}${
      patent.description?.length > 2000 ? "..." : ""
    }

## Products to Analyze
${JSON.stringify(company_products)}

## Analysis Instructions
1. Carefully analyze each product against the patent claims
2. Claims define the legal scope of patent protection
3. Consider both literal infringement and doctrine of equivalents
4. For each potentially infringing product, provide:
   - Which specific claims are potentially infringed
   - How the product features map to claim elements
   - Level of infringement risk (high/medium/low)
   - Confidence level of your assessment (0-100%)

## Output Format
Return a JSON array of potentially infringing products only. Each object should follow this format:
{
  "id": [product ID],
  "name": "[product name]",
  "infringement_risk": "high/medium/low",
  "confidence": [0-100],
  "infringing_claims": [array of claim numbers],
  "infringement_analysis": "[detailed explanation of potential infringement]",
  "product_to_claim_mapping": "[explanation of how product features map to patent claims]"
}

Do NOT include products that don't potentially infringe the patent.`;

    const requestBody = {
      model,
      messages: [
        {
          role: "system",
          content:
            "You are an experienced patent attorney specializing in technical patent analysis and infringement assessment. Your analysis should be objective, detailed, and based primarily on patent claims while considering standard patent law principles including literal infringement and doctrine of equivalents. Identify specific claim elements that match product features and provide confidence levels for your assessments.",
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

        return {
          status: 1,
          message: "generate_summary_success",
          data: results,
        };
      } else {
        return { status: 0, message: `generate_summary_failed${response}` };
      }
    } catch (error: any) {
      return {
        status: 0,
        message: `generate_summary_failed_with_error: ${error.message}`,
      };
    }
  }
}
