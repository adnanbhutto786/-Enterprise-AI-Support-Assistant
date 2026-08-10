import sys
from rag_pipeline import EnterpriseRAGPipeline

def main():
    print("Initializing Enterprise AI Support Assistant...")
    try:
        pipeline = EnterpriseRAGPipeline()
    except ValueError as e:
        print(f"Startup Error: {e}")
        print("Please check your .env file and ensure OPENAI_API_KEY is set.")
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred during initialization: {e}")
        sys.exit(1)

    print("\n" + "="*50)
    print("Welcome to the Enterprise AI Support Assistant!")
    print("Type 'quit' or 'exit' to stop.")
    print("="*50 + "\n")

    while True:
        try:
            question = input("\nYou: ")
            if question.lower() in ['quit', 'exit']:
                print("Goodbye!")
                break
            
            if not question.strip():
                continue

            print("\nThinking...")
            result = pipeline.ask(question)
            
            print("\nAI:", result["answer"])
            
            if not result["confidence_low"] and result["citations"]:
                print("\nSources:")
                print(result["citations"])
                
        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except Exception as e:
            print(f"\nAn error occurred while processing your question: {e}")

if __name__ == "__main__":
    main()
