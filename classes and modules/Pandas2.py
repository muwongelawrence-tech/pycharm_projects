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