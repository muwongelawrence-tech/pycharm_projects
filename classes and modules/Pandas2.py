import pandas as pd
# series = pd.Series([0, 1, 2, 3])
# print(series)

series = pd.Series([0, 11, 25, 30, 48, 52])

print("Values:", series.values)
print("Indices:", series.index, "\n")

print(series[1], "\n")   # Get a single value

print(series[1:4]) # Get a range of values

# indexes in pandas can be of different types
data = pd.Series([12, 24, 13, 54], index=['a', 'b', 'c', 'd'])
print(data, "\n")
print("Value at index b:", data['b'])

# create a Series from a dictionary, and then we will perform indexing and slicing
fruits_dict = { 'apples': 10, 'oranges': 8, 'bananas': 3, 'strawberries': 20 }

fruits = pd.Series(fruits_dict)
print("Value for apples: ", fruits['apples'], "\n")

# Series also supports array-style operations such as slicing:
print(fruits['bananas':'strawberries'])

print("------------------working with data frames------------------")

data_s1 = pd.Series([12, 24, 33, 15],
           index=['apples', 'bananas', 'strawberries', 'oranges'])

# 'quantity' is the name for our column
dataframe1 = pd.DataFrame(data_s1, columns=['quantity'])
print(dataframe1)

print("------------Constructing a DataFrame From a Dictionary#-------------")
dict = {"country": ["Norway", "Sweden", "Spain", "France"],
       "capital": ["Oslo", "Stockholm", "Madrid", "Paris"],
       "SomeColumn": ["100", "200", "300", "400"]}

data = pd.DataFrame(dict)
print(data)

print("------------Constructing a data frame from a dictionary of series-------------")
quantity = pd.Series([12, 24, 33, 15],
                     index=['apples', 'bananas', 'strawberries', 'oranges'])

price = pd.Series([4, 4.5, 8, 7.5],
                  index=['apples', 'bananas', 'strawberries', 'oranges'])

df = pd.DataFrame({'quantity': quantity,
                   'price': price})
print(df)

print(" constructing a dataframe from a file read from the directory.")
# Given we have a file called data1.csv in our working directory:
df = pd.read_csv('data1.csv')

#given json data
df = pd.read_json('data2.json')

print("---------Pandas DataFrame Operations - Read, View and Extract Information.----------")
