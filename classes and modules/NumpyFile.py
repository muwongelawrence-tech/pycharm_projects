import numpy as np

array1 = np.array([1, 2, 3, 4])
print(array1)
print(type(array1))
print("working with two dimension arrays in numpy")
array2 = np.array([[1, 2, 3], [4, 5, 6]])
print(array2)
print(array2.shape)

array3 = np.zeros((3, 4), dtype=int)
array4 = np.ones((3, 4), dtype=int)
array5 = np.full((3, 4), 15, dtype=int)
array6 = np.random.random((3, 4))
print("printing different kinds of arrays with different dimensions")
print(array3)
print(array4)
print(array5)
print(array6)
print("printing first element of array6")
print(array6[0, 0])
print("boolean of all values greater than 0.2")
print(array6 > 0.2)
print("An array of those values greater than 0.2")
print(array6[array6 > 0.2])
print("summing up all values in the array")
print(np.sum(array6))
print("flooring each value in the array")
print(np.floor(array6))
print("ceiling each value of the array")
print(np.ceil(array6))
print("rounding - off values in the array")
print(np.round(array6))

print("some cool arithmetic operations in numpy")
dimensions_inch = np.array([1, 2, 3])
print(f" dimensions in inches { dimensions_inch}")
dimensions_cm = dimensions_inch * 2.54
print("After working with numpy ")
print(f" dimensions in inches { dimensions_cm}")

#implementation using pure python
# dimensions_inch = [1, 2, 3]
# dimensions_cm = [ x * 2.54 for x in dimensions_inch]

# working with The mean() function in numpy

print("-----working with The mean() function in numpy-------")
Calorie_burnage = [240, 250, 260, 270, 280, 290, 300, 310, 320, 330]
print(Calorie_burnage)
Average_calorie_burnage = np.mean(Calorie_burnage)

print(f"The mean of the above is { Average_calorie_burnage }")

#0-D arrays
print("---zero dimension arrays-----")
arr = np.array(42)
print(f"Zero dimension array containg value { arr }")

print("Two dimension Arrays")
arr1 = np.array([[1, 2, 3], [4, 5, 6]])
print(arr1)

print("Three Dimension Arrays")
arr3 = np.array([[[1, 2, 3], [4, 5, 6]], [[1, 2, 3], [4, 5, 6]]])
print(arr3)


# Access the third element of the second array of the first array:
print("Access the third element of the second array of the first array:")
array_3 = np.array([[[1, 2, 3], [4, 5, 6]], [[7, 8, 9], [10, 11, 12]]])

print(f"The item is { array_3[0, 1, 2] }")

# a = np.array7(42)
# b = np.array7([1, 2, 3, 4, 5])
# c = np.array7([[1, 2, 3], [4, 5, 6]])
# d = np.array7([[[1, 2, 3], [4, 5, 6]], [[1, 2, 3], [4, 5, 6]]])
#
# print(a.ndim)
# print(b.ndim)
# print(c.ndim)
# print(d.ndim)

# NumPy Array Slicing
print("Return every other element from index 1 to index 5:")
arr_x = np.array([1, 2, 3, 4, 5, 6, 7])

print(arr_x[1:5:2])

# Slicing 2-D Arrays
print("slicing 2-D Arrays")
arr_2d = np.array([[1, 2, 3, 4, 5], [6, 7, 8, 9, 10]])

print(arr_2d[1, 1:4])

print("From both elements, return index 2:")
arr = np.array([[1, 2, 3, 4, 5], [6, 7, 8, 9, 10]])
print(arr)
print(arr[0:2, 2])

print("From both elements, slice index 1 to index 4 (not included), this will return a 2-D array:")
arr = np.array([[1, 2, 3, 4, 5], [6, 7, 8, 9, 10]])
print(arr)
print(arr[0:2, 1:4])

# Checking the Data Type of an Array
print("-------Checking the Data Type of an Array----")
arr = np.array(['apple', 'banana', 'cherry'])
print(arr)
print(f"The datatype is { arr.dtype }")

print("Creating an array of string datatype")
arr_S = np.array([1, 2, 3, 4], dtype='S')
print(arr_S)
print(arr_S.dtype)

# Converting Data Type on Existing Arrays
print("Change data type from float to integer by using 'i' as parameter value:")
arr = np.array([1.1, 2.1, 3.1])
print(arr)
newarr = arr.astype('i')
print(newarr)
print(newarr.dtype)

print("Create an array with data type 4 bytes integer:")
arr = np.array([1, 2, 3, 4], dtype='i4')
print(arr)
print(arr.dtype)

print("--------Change data type from integer to boolean:-------")
arr = np.array([1, 0, 3])
print(arr)
newarr = arr.astype(bool)
print(newarr)
print(newarr.dtype)

# NumPy Array Copy vs View
print("----NumPy Array Copy vs View-----")
print("Lets try the copy version ")
arr = np.array([1, 2, 3, 4, 5])
x = arr.copy()
arr[0] = 42
print(arr)
print(x)

print("lets try the view version")
arr = np.array([1, 2, 3, 4, 5])
x = arr.view()
x[0] = 31
print(arr)
print(x)

print("--------using base in numpy arrays-----------")
arr = np.array([1, 2, 3, 4, 5])
print(f"original array is { arr }")
x = arr.copy()
y = arr.view()
print(f" x.base = { x.base }")
print(f"y.base = { y.base }")

print("--getting shape with n-dimensional arrays ------------")
arr = np.array([1, 2, 3, 4], ndmin=5)
print(arr)
print('shape of array :', arr.shape)

# NumPy Array Reshaping
print("-------NumPy Array Reshaping------------")
arr = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
print(arr)
newarr = arr.reshape(4, 3)
print(f" After reshaping new array is { newarr }")

print("Check if the returned array is a copy or a view:")
arr = np.array([1, 2, 3, 4, 5, 6, 7, 8])
print(arr.reshape(2, 4).base)

# You are allowed to have one "unknown" dimension.
#
# Meaning that you do not have to specify an exact number for one of the dimensions in the reshape method.
#
# Pass -1 as the value, and NumPy will calculate this number for you.
print("--------- working with unknown dimensions ---")
arr = np.array([1, 2, 3, 4, 5, 6, 7, 8])
newarr = arr.reshape(2, 2, -1)
print(newarr)

print("-----Flattening an array-----------")
arr = np.array([[1, 2, 3], [4, 5, 6]])
print(arr)
newarr = arr.reshape(-1)
print(f"flattened array is { newarr }")

# There are a lot of functions for changing the shapes of arrays
# in numpy flatten, ravel and also for rearranging the elements
# rot90, flip, fliplr, flipud etc

print("-----Iterating over numpy arrays------------")
arr = np.array([[1, 2, 3], [4, 5, 6]])
print(arr)
print("results of iteration are ;")
for x in arr:
  print(x)

print("or")
for x in arr:
   for y in x:
      print(y)

print("Iterating over a 3-D Array")
arr = np.array([[[1, 2, 3], [4, 5, 6]], [[7, 8, 9], [10, 11, 12]]])
print(arr)
print("results of iteration are ;")
for x in arr:
  print(x)

print('or iterating through all ellements yields ')
for x in arr:
  for y in x:
    for z in y:
      print(z)

print("using nditer operation while iterating a numpy array")
arr = np.array([[[1, 2], [3, 4]], [[5, 6], [7, 8]]])
for x in np.nditer(arr):
  print(x)

# Iterating Array With Different Data Types
print("Iterating Array With Different Data Types")
print("----Iterate through the array as a string---------")
arr = np.array([1, 2, 3])
for x in np.nditer(arr, flags=['buffered'], op_dtypes=['S']):
  print(x)

print("Iterating with a different step size ")
print("Iterate through every scalar element of the 2D array skipping 1 element:")
arr = np.array([[1, 2, 3, 4], [5, 6, 7, 8]])

for x in np.nditer(arr[:, ::2]):
  print(x)