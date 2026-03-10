import os

def main():
    # Fixed list of workers as per user request
    workers = [
        "JobFinderWorker.py",
        "ScraperWorker.py",
        "ApplyTypeWorker.py",
        "ApplyWorker.py",
        "ResumeGeneratorWorker.py"
    ]

    while True:
        print("\n" + "="*30)
        print("   HireIQ Worker Runner")
        print("="*30)
        for i, worker in enumerate(workers, 1):
            print(f"{i}. {worker}")
        print("0. Exit")
        print("-" * 30)

        try:
            choice = input("Select a worker to run (or 0 to exit): ").strip()
            if choice == '0' or not choice:
                print("Exiting...")
                break
            
            choice_int = int(choice)
            if 1 <= choice_int <= len(workers):
                selected_worker = workers[choice_int - 1]
                worker_path = os.path.join("Workers", selected_worker)
                
                # Verify file existence before attempting to run
                if not os.path.exists(worker_path):
                    print(f"[ERROR] Worker file not found: {worker_path}")
                    continue

                print(f"\n[INFO] Launching {selected_worker} in a new terminal window...")
                
                # Windows command to start a new CMD window and run the worker
                # cmd /k keeps the window open after the script finished
                os.system(f'start "{selected_worker}" cmd /k "python Workers\\{selected_worker}"')
            else:
                print(f"[ERROR] Invalid selection. Please pick a number between 1 and {len(workers)}.")
        except ValueError:
            print("[ERROR] Please enter a valid numeric value.")
        except Exception as e:
            print(f"[ERROR] An unexpected error occurred: {e}")

if __name__ == "__main__":
    main()
