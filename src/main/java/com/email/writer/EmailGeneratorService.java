package com.email.writer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;
    private final String apiKey;

    public EmailGeneratorService(WebClient.Builder webClientBuilder, @Value("${gemini.api.url}")String baseUrl, @Value("${gemini.api.key}") String geminiApiKey) {
        this.apiKey = geminiApiKey;
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    }

    public String generateEmailReply(EmailRequest emailRequest) {
      //Build Prompt
       String prompt = buildPrompt(emailRequest);


       //Prepare raw JSON body
        String requestBody = String.format(("""
                {
                   "contents":[
                     {
                       "parts": [
                            {
                              "text":"%s"
                            }
                       ]
                     }
                   ]
                }
                """),prompt);

        //Send Request
        String response = webClient.post().uri(uriBuilder -> uriBuilder.path("/v1beta/models/gemini-2.5-flash:generateContent").build()).header("x-goog-api-key",apiKey).header("Content-Type","application/json").bodyValue(requestBody).retrieve().bodyToMono(String.class).block();

        //Extract Response
       return extractResponseContent(response);

    }

    private String extractResponseContent(String response) {

        try{
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);
             return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("You are an expert business communication assistant. ");
        prompt.append("Your task is to draft a well-structured, professional email reply based on the message below. ");
        prompt.append("Ensure the reply is polite, concise, and contextually appropriate without subject");

        if (emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
            prompt.append("Write the response in a ")
                    .append(emailRequest.getTone())
                    .append(" tone. ");
        }

        prompt.append("Do not include unnecessary explanations or meta comments. ");
        prompt.append("The reply should feel natural as if written by a human professional. ");
        prompt.append("\n\n--- Original Email ---\n");
        prompt.append(emailRequest.getEmailContent());
        prompt.append("\n--- End of Email ---\n\n");
        prompt.append("Now, generate only the reply message:\n");

        return prompt.toString();
    }


}
