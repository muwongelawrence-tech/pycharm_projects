#importing the math module
import math
from sys import getsizeof
from pprint import pprint

from max import find_max

print('hello muwonge, welcome to \n python programming.')
print("3 squared is " + str(3**2))
print(f"ceiling 2.9 is {math.ceil(2.9)}")
print(f"flooring 2.9 is {math.floor(2.9)}")
print(f"absolute of -2.9 is {abs(-2.9)}")
print(f"rounding-off 2.9 is {round(2.9)}")
course = "python programming"
print(course)
print(f"The length of the above string is {len(course)}")
print("lets print a multiline string.")
email = '''
---------------------------------------------------
hi john , 
welcome on the board
we have been really missing you
regards;
---------------------------------------------------
'''


print(email)
#numbers and operators section
#complex numbers x = a +bi
print("lets see some arithmetic operations")
print(f"10 + 3 is {10 + 3}")
print(f"10 - 3 is {10 - 3}")
print(f"10 * 3 is {10 * 3}")
print(f"10 / 3 is {10 / 3}")
print(f"10 // 3 is {10 // 3}")
print(f"10 % 3 is {10 % 3}")
print(f"10 ** 3 is {10 ** 3}")

print("lets get input from the user:")
x = input("x: ")
y = int(x) + 1
print(f"y is {y}")

#lets print alist of items
print("lists ------------------------")
numbers = list(range(20))
zeros = [0]*5
print(zeros)
print(numbers)
combined = numbers + zeros
print(f"The combined list of the two is { combined }")

name = list("Muwonge Lawrence")
print(name)
print(f"Evens in the numbers list are { numbers[::2] }.")
print(f"numbers list items reversed { numbers[::-1] }.")
print(f"numbers list items sorted in asc { numbers.sort() }.")
print(f"numbers list items in desc { numbers.sort(reverse=True) }.")

#lets use the enumerate function
print("using the enumerate function on the list")
for index, number in enumerate(numbers):
    print(index, number)

#lambda expressions
print("using lambda expressions to sort a list of tuples")
items = [
    ("Product1",10),
    ("Product2",9),
    ("Product2",12),
]
#ascending order
items.sort(key=lambda item:item[1])
#descending order
#items.sort(key=lambda item:item[1],reverse=True)
print(items)

#Mapping
print("mapping items in one list to the other.")
prices = list(map(lambda item: item[1], items))
print(prices)
#filtering using lambda expressions
print("filtering items using a lambda expressions.")
filtered = list(filter(lambda item: item[1] >= 10,items))
print(f"the filtered list of prices greater than ten is { filtered }")

#comprehesion
print("using list comprehension is better than lambda expressions")
prices2 = [item[1] for item in items]
print(prices2)
print("filtering using list comprehension is better than more elegant than using lambda expressions.")
filtered2 = [item for item in items if item[1] >= 10]
print(filtered2)

#combining two lists using the zip method
print("combining two lists using the zip method")
list1 = [1, 2, 3, 4]
list2 = [10, 20, 30, 40]
zipped = list(zip("abcd", list1, list2))
print(zipped)

#Swapping
print('-----------Swapping two variables------------')
x = 10
y = 11
print(f"x: {x}")
print(f"y: {y}")
x, y = y, x

print(f"after swapping x is {x} and y is {y}")

#sets
numbers = [1, 1, 2, 3, 4]
first = set(numbers)
second = { 1, 5, 6 }
print(f"The union of the two sets is { first | second }")
print(f"The intersection of the two sets is { first & second}")
print(f"The difference of the two sets is { first - second}")
print(f"The symetric difference of the two sets is { first ^ second}")


#dictionaries
print("---------dictionaries--------------")
point = dict(x=1,y=2)
print(point)
print(f"The value of key x is : { point.get('x')}")
print(f"The value of key y is : { point.get('y')}")
print(f"The value of key a is : { point.get('a',0)}")

print("-------iterating a dictionary----------")
print("this is done by unpacking a tuple from point.items()")
for key, value in point.items():
    print(key, value)

print("-------Dictionary comprehension-----------")
values1 = { x*2 for x in range(5)}
print(f"set comprehension of elements { values1 }")

values2 = { x: x*2 for x in range(5)}
print(f"Dictionary comprehension of elements { values2 }")

#Generator objects
print("---Generator objects are usually got if comprehension is applied on tuples---")
values = (x*2 for x in range(100000))
print(f"The size of the generator in memory is { getsizeof(values)} bytes.")

#unpacking operator
numbers = [1,2,3]
print(f"The unpacked items are;")
print(*numbers)
print("unpacking dictionaries we use ** for example; ")
dict1 = { 'x': 1, 'y': 4}
dict2 = {'a': 3, 'b': 5}
dict3 = {**dict1, **dict2, 'c': 7 }
print(f"The resultant dictionary after unpacking dict1 and dict2 is { dict3 }")

#finding the most repeated character in the following string.
print("finding the most repeated character in the string \"This is a common interview question\"")
sentence = "This is a common interview question"
char_frequency = {}
for char in sentence:
    if char in char_frequency:
        char_frequency[char] += 1
    else:
        char_frequency[char] = 1

pprint(char_frequency, width=1)
char_frequency_sorted = sorted(char_frequency.items(),
       key=lambda kv: kv[1],
       reverse=True
       )

print(f"{char_frequency_sorted[0]} is the most repeated character.")


#functions section
print("--------functions section----------------")

def save_user(**user):
    print(user)


save_user(id=1, name="muwonge", age=22)


def multiply(*numbers):
    total = 1
    for number in numbers:
        total *= number
    return total


print(multiply(2,4,7))


#fizz_buzz algorithm
def fizz_buzz(input):
    if input % 3 == 0 and input % 5 == 0:
         print("fizz_buzz")
    elif input % 3 == 0:
         print("Fizz")
    elif input % 5 == 0:
         print("Buzz")
    else:
        print(input)


number = int(input("Enter value:  "))
fizz_buzz(number)

#Exception handling
print("-------Exception handling --------------")
try:
    age = int(input("Age: "))
    xfactor = 10 / age
except (ValueError, ZeroDivisionError):
    print("you didn't enter a valid age.")
else:
    print("No exceptions were encountered")
finally:
    print("cleaning up and releasing external resources is done in the \n "
          "finally clause.")


print('------------finding the maximum in the list--------- ')
numbers = [2, 3, 4, 5, 8, 9, 10]
maximum = find_max(numbers)
print(f' The maximum in the list is { maximum }.')

