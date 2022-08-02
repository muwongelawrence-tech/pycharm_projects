command = ''
started = False

while True:
    command = input('> ').lower()
    if command == "start":
        if started:
            print("Car already started ..!!")
        else:
            started = True
            print('Car started... ')

    elif command == "stop":
        if not started:
            print("car already stopped...!!  ")
        else:
            started = False
            print(" Car Stopped... ")

    elif command == "help":
        print("""
            start -> for starting the car
            stop -> for stopping the car
            quit for exiting the program
            
        """)
    elif command == "quit":
        break;