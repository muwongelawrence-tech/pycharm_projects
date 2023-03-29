import pandas as pd 

series = pd.Series([0, 1, 2, 3, 4, 5])

print("Values:", series.values)
print("Indices:", series.index, "\n")

print(series[1], "\n")   # Get a single value

print(series[1:4]) # Get a range of values

#using a different type as index of the pandas series
print ("using a different type as index of the pandas series")
data = pd.Series([12, 24, 13, 54], 
                index=['a', 'b', 'c', 'd'])

print(data, "\n")
print("Value at index b:", data['b'])

print("------------------creating series from a python dictionary----------")
fruits_dict = { 'apples': 10,
                'oranges': 8,
                'bananas': 3,
                'strawberries': 20}

fruits = pd.Series(fruits_dict)
print("Value for apples: ", fruits['apples'], "\n")

# Series also supports array-style operations such as slicing:
print(fruits['bananas':'strawberries'])

data_s1 = pd.Series([12, 24, 33, 15], index=['apples', 'bananas', 'strawberries', 'oranges'])

# 'quantity' is the name for our column
dataframe1 = pd.DataFrame(data_s1, columns=['quantity'])
print(dataframe1)

#Constructing a DataFrame From a Dictionary
print("********Constructing a DataFrame From a Dictionary****************")

dict = {"country": ["Norway", "Sweden", "Spain", "France"],
       "capital": ["Oslo", "Stockholm", "Madrid", "Paris"],
       "SomeColumn": ["100", "200", "300", "400"]}

data = pd.DataFrame(dict)
print(data)

#We can also construct a DataFrame from a dictionary of Series objects
print("------We can also construct a DataFrame from a dictionary of Series objects-------")

quantity = pd.Series([12, 24, 33, 15], 
           index=['apples', 'bananas', 'strawberries', 'oranges'])

price = pd.Series([4, 4.5, 8, 7.5], 
           index=['apples', 'bananas', 'strawberries', 'oranges'])
           
df = pd.DataFrame({'quantity': quantity,
                    'price': price})
print(df)

# Constructing a Dataframe by Importing Data From a File
print("Constructing a Dataframe by Importing Data From a File")

# Given we have a file called data1.csv in our working directory:
df = pd.read_csv('data1.csv')

#given json data
df = pd.read_json('data2.json')