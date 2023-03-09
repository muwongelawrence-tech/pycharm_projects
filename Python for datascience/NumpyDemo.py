# Import the numpy package
import numpy as np

print("----------------------How to create a numpy array--------------- ")
# Create a 1d integer array from a list
arr1 = np.array([1, 2, 3, 4])

# Print the array and its type
print(arr1)
print(type(arr1))

print("----------------------creating arrays with floats--------------- ")
# Create a 1d float array
arr2 = np.array([1, 2, 3, 4], dtype='float32')

# Print the array and its type
print(type(arr2))
print(arr2)


# Create a 2d array from a list of lists
print("------------------creating 2d and 3d  numpy arrays --------------- ")
lists = [[0,1,2], [3,4,5], [6,7,8]]
arr2d = np.array(lists)

print(arr2d)

arr1 = np.array([1, 2, 3, 4])
print(arr1)

# performing vectorized operations using numpy arrays
print("------performing vectorized operations using numpy arrays -----------")
# Vector (element-wise) operations
print(arr1 * 2)
print(arr1 + 2)
print(arr1 * arr1)

#creating Arrays from scratch
print("---------------- creating arrays from scratch ------------------------")
# Create an integer array of length 100 filled with zeros
print("Create an integer array of length 100 filled with zeros")
np.zeros(100, dtype=int)
print(np.zeros(100, dtype=int))

# Create a 3x3 floating-point array filled with 1s
print("Create a 3x3 floating-point array filled with 1s")
np.ones((3, 3), dtype=float)
print(np.ones((3, 3), dtype=float))

# Create an array filled with a linear sequence
# Starting at 0, ending at 20, stepping by 3
# (this is similar to the built-in range() function)
print("Create an array filled with a linear sequence, Starting at 0, ending at 20, stepping by 3, ")
np.arange(0, 20, 3)
print(np.arange(0, 20, 3))

# Create an array of hundred values evenly spaced between 0 and 1
print("Create an array of hundred values evenly spaced between 0 and 1")
np.linspace(0, 1, 100)
print(np.linspace(0, 1, 100))

# Create a 3x3 array of uniformly distributed random values between 0 and 1
print(" Create a 3x3 array of uniformly distributed random values between 0 and 1")
np.random.random((3, 3))
print(np.random.random((3, 3)))

# Create a 3x3 array of random integers in the interval [0, 10)
print("Create a 3x3 array of random integers in the interval [0, 10)")
np.random.randint(0, 10, (3, 3))
print(np.random.randint(0, 10, (3, 3)))

# Create a 3x3 array of normally distributed random values
# with mean 0 and standard deviation 1
print("Create a 3x3 array of normally distributed random values, with mean 0 and standard deviation 1 ")
np.random.normal(0, 1, (3, 3))
print(np.random.normal(0, 1, (3, 3)))

np.random.randint(10, size=6)  # One-dimensional array of random integers
np.random.randint(10, size=(3, 3))  # Two-dimensional array of random integers
np.random.randint(10, size=(3, 3, 3))  # Three-dimensional array of random integers


# Create a 3x3 array of random integers in the interval [0, 10)
print("--------Analysing a numpy array attributes----------------------------")
print("let's Create a 3x3 array of random integers in the interval [0, 10)")
x = np.random.randint(0, 10, (3, 3))
print(np.random.randint(0, 10, (3, 3)))

print("ndim: ", x.ndim)
print("shape:", x.shape)
print("x size: ", x.size)
print("dtype:", x.dtype)
print("itemsize:", x.itemsize, "bytes")
print("nbytes:", x.nbytes, "bytes")

print("--------------Array Indexing and accessing single elements--------------")
# Input array
x1 = np.array([1, 3, 4, 4, 6, 4])
print(x1)

# Assess the first value of x1
print("The first value of x1 positions:", end=" ")
print(x1[0])

# Assess the third value of x1
print("The third value of x1 positions:", end=" ")
print(x1[2])

# Get the last value of x1
print("The last value of x1 positions:", end=" ")
print(x1[-1])

# Get the second last value of x1
print("The second last value of x1 positions:", end=" ")
print(x1[-2])

print("--lets try slicing on multidimensional arrays--")
# In a multidimensional array, we need to specify row and column index. Given input array x2:
x2 = np.array([[3, 2, 5, 5],[0, 1, 5, 8], [3, 0, 5, 0]])
print("x2 = ", end="")
print(x2)


print("Value in 3rd row and 4th column of x2: ", end=" ")
print(x2[2,3])


print("3rd row and last value from the 3rd column of x2:", end=" ")
print(x2[2,-1])
#>0

# Replace value in 1st row and 1st column of x2 with 1
x2[0,0] = 1
print("updated x2 = ", end="")
print(x2)

print("-------------------slicing using the slice notation----------")
x1 = np.arange(10) # Input array
print("x1 = ", end="")
print(x1)

# Get the first 5 elements of x
print("the first 5 elements of x are: ", end="")
print(x1[:5])

# Elements after index 4
print("Elements after index 4: ", end="")
print(x1[4:])


# From 4th to 6th position
print("Elements from 4th to 6th position: ", end="")
print(x1[4:7])

# Return elements at even place (every other element)
print("Elements at even places are: ", end="")
print(x1[ : : 2])

#return elements from 1st position step by 2 (every other element starting at index 1)
print("Elements from 1st position step by 2 are: ", end="")
print(x1[1::2])

print("Applying a negative step value to reverse the array")
#reverse the array
print("Reversed array: ", end="")
print(x1[::-1])

# reverse every other element starting from index 5
print("Array after reversing every other element starting from index 5: ", end="")
print(x1[5::-2])

print("------------multidimensional slices-------------------")
#Two dimentional array
x2 = np.array([[0,1,2], [3,4,5], [6,7,8]])
print(x2)

# Extract the first two rows and two columns
print("The first two rows and columns are: ")
print(x2[:2, :2])

# all rows, every other column
print("All rows, every other column: ")
print(x2[:3, ::2])

# Reverse only the row positions
print("The array after reversing the row positions: ")
print(x2[::-1, ])

# Reverse the row and column positions
print("The array after reversing the row and column positions: ")
print(x2[::-1, ::-1])

#A modification on the array obtained from the slicing operation ,
# without changing the original array
x2_subcopy = x2[::-1, ::-1].copy()

# creating a one dimensional array  and then covert it to a desired shape
print("creating a one dimensional array  and then covert it to a desired shape")
reshaped = np.arange(1, 10).reshape((3, 3))
print(reshaped)

print("converting a one dimensinal array to a one by three")
x = np.array([1, 2, 3])
print(x)

# row vector via reshape
x_rv= x.reshape((1, 3))
print(x_rv)

# column vector via reshape
x_cv = x.reshape((3, 1))
print(x_cv)

# We can concatenate two or more arrays at once.
x = np.array([1, 2, 3])
y = np.array([3, 2, 1])
z = [11,11,11]

print("The concatenated single dimension array is:", end=" ")
print(np.concatenate([x, y, z]))
#> array([ 1,  2,  3,  3,  2,  1, 11, 11, 11])

# We can also concatenate 2-dimensional arrays.
grid = np.array([[1,2,3] , [4,5,6]])
print("The concatenated two-dimension array is:")
print(np.concatenate([grid, grid]))

# Trying the vertical stack and horizontal stack incase of concatenating
# two numpy arrays of different dimensions 
x = np.array([3,4,5])
grid = np.array([[1,2,3],[9,10,11]])

# vertically stack the arrays
print("Veritcally stacked array: ")
print(np.vstack([x,grid]))

 # horizontally stack the arrays
z = np.array([[19],[19]])
print("Horizontally stacked array:")
print(np.hstack([grid,z]))

# splitting Arrays to a desired number
print("----------splitting Arrays to a desired number------------")
x = np.arange(10)
#splitting a single array into multiple arrays

x1, x2, x3 = np.split(x,[3,6])
print("The splitted arrays are:")
print(x1, x2, x3)

# performing both vertical and horizontal splitting
print("performing both vertical and horizontal splitting")
grid = np.arange(16).reshape((4, 4))
print("grid: ")
print(grid, "\n")

# Split vertically and print upper and lower arrays
upper, lower = np.vsplit(grid, [2])
print("Upper part: ")
print(upper)
print("Lower part: ")
print(lower, "\n")

# Split horizontally and print left and right arrays
left, right = np.hsplit(grid, [2])
print("Left part: ")
print(left)
print("Right part: ")
print(right)

print("----------------Testing Mathematical computations----------------")

x = np.arange(10)

# Native arithmentic operators
print("x =", x)
print("x + 5 =", x + 5)
print("x - 5 =", x - 5)
print("x * 5 =", x * 5)
print("x / 5 =", x / 5)
print("x ** 2 = ", x ** 2)
print("x % 2  = ", x % 2)

# OR we can use explicit functions, ufuncs, e.g. "add" instead of "+"
print('we can use explicit functions, ufuncs, e.g. "add" instead of "+"')
print(np.add(x, 5))
print(np.subtract(x, 5))
print(np.multiply(x, 5))
print(np.divide(x, 5))
print(np.power(x, 2))
print(np.mod(x, 2))

print("------Testing the trigonometric functions of numpy--------------")
theta = np.linspace(0, np.pi, 4)
print("theta      = ", theta)
print("sin(theta) = ", np.sin(theta))
print("cos(theta) = ", np.cos(theta))
print("tan(theta) = ", np.tan(theta))

# Testing the logarithms and exponential functions
print("------------Testing the logarithms and exponential function--------")
x = [1, 2, 3]
print("x     =", x)
print("e^x   =", np.exp(x))
print("2^x   =", np.exp2(x))
print("3^x   =", np.power(3, x))

print("ln(x)    =", np.log(x))
print("log2(x)  =", np.log2(x))
print("log10(x) =", np.log10(x))

# working with accumulate and reduce functions
print("working with accumulate and reduce functions")
x = np.arange(1, 6)
sum_all = np.add.reduce(x)

print(x)
print(sum_all)

#If we need to store all the intermediate results of the computation,
# we can use accumulate() instead
print("working with accumulate function incase we need to store all the intermediate results ")
x = np.arange(1, 6)
sum_acc = np.add.accumulate(x)

print(x)
print(sum_acc)

# Aggregations 
x = np.random.random(100)

# Sum of all the values
print("Sum of values is:", np.sum(x))
# Mean value
print("Mean value is: ", np.mean(x))

#For min, max, sum, and several other NumPy aggregates, 
#a shorter syntax is to use methods of the array object itself,
# i.e. instead of np.sum(x), we can use x.sum()
print("Sum of values is:", x.sum())
print("Mean value is: ", x.mean())
print("Max value is: ", x.max())
print("Min value is: ", x.min())

# performing aggregations on multidimensional arrays
print("--------performing aggregations on multidimensional array---------")
grid = np.random.random((3, 4))
print(grid)

print("Overall sum:", grid.sum())
print("Overall Min:", grid.min())

# Row wise and column wise min
print("Column wise minimum: ", np.amin(grid, axis=0))
print("Row wise minimum: ", np.amin(grid, axis=1))

# working with comparisons and boolean masks
print("working with comparisons and boolean masks")
x = np.array([1, 2, 3, 4, 5])

print(x < 2) # less than
print(x >= 4) # greater than or equal

print("We can also do an element-by-element comparison of two arrays and include compound expressions")
x = np.array([1, 2, 3, 4, 5])


print("Elements for which multiplying by two is the same as the square of the value: ")
print((2 * x) == (x ** 2))

print("checking other powerful functions in numpy like any and all")
x = np.arange(10)
print(x)

# How many values less than 6?
print(np.count_nonzero(x < 6))

# Are there any values greater than 8?
print(np.any(x > 8))

# Are all values less than 10?
print(np.all(x < 10))

print("---------Handling boolean masks using the numpy array----------")
# Random integers between [0, 10) of shape 3x3
x = np.random.randint(0, 10, (3, 3))
print(x)

# Boolean array
print(x < 6)

# Boolean mask
print(x[x < 6])