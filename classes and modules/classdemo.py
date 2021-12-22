#use of modules
from abc import ABC, abstractmethod
from sales import greet
from sales import get_phone, emoji_converter

greet()
print("----lets be greeted by the program in amore condusive way.---")
emoji_converter()

# class definitions(implementing OOP in python)
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        return f"({self.x},{self.y})"

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

    def __gt__(self, other):
        return self.x > other.x and self.y > other.y

    def __add__(self, other):
        return Point(self.x + other.x, self.y + other.y)

    def draw(self):
        print("----Drawing the point to the terminal------")
        print(f" The received point is Point ({self.x}, {self.y})")


point = Point(1, 2)
point.draw()
print(isinstance(point, Point))
# print(point.x)
# print(point.y)

# python3 magic methods
print(point.__str__())

# comparing two objects(we use different magic methods)
point1 = Point(12, 13)
other = Point(2, 3)
print(point1 == other)
print(point1 > other)

# magic methods for arithemetic operations
print(point1 + other)


class TagCloud:
    def __init__(self):
        self.tags = {}

    def add(self, tag):
        self.tags[tag] = self.tags.get(tag, 0) + 1

    def __getitem__(self, tag):
        return self.tags.get(tag.lower(), 0)

    def __setitem__(self, tag, count):
        self.tags[tag.lower()] = count

    def __len__(self):
        return len(self.tags)

    def __iter__(self):
        return iter(self.tags)


cloud = TagCloud()
cloud.add("Python")
cloud.add("python")
cloud.add("python")
print(cloud.tags)
print(len(cloud))


# making some methods of the class private and defining getters and setters
class Product:
    def __init__(self, price):
        self.price = price

    # using decorators in python
    @property
    def price(self):
        return self.__price

    @price.setter
    def price(self, value):
        if value < 0:
            raise ValueError("Price can not be negative.")
        self.__price = value

    # using property decorator  would achieve the same result.
    # price = property(get_price, set_price)


product = Product(10)
print(product.price)


# inherintance in classess.
class Animal:
    def __init__(self):
        self.age = 1

    def eat(self):
        print("eat")

    def walk(self):
        print("walk")


class Fish(Animal):
    def swim(self):
        print("swimming")


# overriding
class Mammal(Animal):
    def __init__(self):
        super().__init__()
        self.weight = 2

    def die(self):
        print("die")


fish = Fish()
print(fish.age)
fish.walk()
fish.eat()
fish.swim()

mammal = Mammal()
print(mammal.age)
print(mammal.weight)


# lets try writing a good example of inheritance

class InvalidOperationError(Exception):
    pass


# making the stream method abstract.
class Stream(ABC):
    def __init__(self):
        self.opened = False

    def open(self):
        if self.opened:
            raise InvalidOperationError("Stream is already open")
        self.opened = True

    def close(self):
        if not self.opened:
            raise InvalidOperationError("Stream is already closed")
        self.opened = False

    @abstractmethod
    def read(self):
        pass


class FileStream(Stream):
    def read(self):
        print("specify how data is read from a file in this block")


class NetworkStream(Stream):
    def read(self):
        print("specify how data is read from a network  in this block")


class MemoryStream(Stream):
    def read(self):
        print("specify how data is read from memory  in this block")

# remember that an abstract class can not be instantiated.
# if a class inherits Stream and it does not implement the read method ,
# it is also considered abstract.


 #Extending built in types using inherintance
class Text(str):
    def duplicate(self):
         return self + self


text = Text("Muwonge")
print(text.duplicate())

print("----------Now lets look at a phone number interpreter----------")
get_phone()
