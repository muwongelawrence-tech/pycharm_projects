def calc_tax():
    pass


def calc_shipping():
    pass

def greet():
    print("hello , Muwonge welcome to python programming")


digits_mapping = {
    "0": "Zero",
    "1": "One",
    "2": "Two",
    "3": "Three",
    "4": "Four",
    "5": "Five",
    "6": "Six",
    "7": "Seven",
    "8": "Eight",
    "9": "Nine",
}

emojis = {
    ":)" : "🙁",
    ":(" : "🙄"
}



def get_phone():
    phone = input("Phone >")
    output = ""
    for ch in phone:
        output += digits_mapping.get(ch, "!") + " "
    print(output)


def emoji_converter():
    message = input("> ")
    words = message.split(" ")
    output = ""
    for word in words:
        output += emojis.get(word, word) + " "
    print(output)
