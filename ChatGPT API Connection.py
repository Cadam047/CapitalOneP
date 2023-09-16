import requests
URL = "https://openai.com/v1/chat/completions"

payload = {
    "model: gpt-3.5-turbo",
    "messages: [{"role: user", "content: f"prompt"}],
    "temperature": 1.0,
    "top_p": 1.0,
    "n" : 1,
    "stream": True
    "presence_penalty": 0,
    "frequency_penalty":0,
}
