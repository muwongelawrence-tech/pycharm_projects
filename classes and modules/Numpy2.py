import numpy as np;
# Input array
x1 = np.array([1, 3, 4, 4, 6, 4])

# Assess the first value of x1
# x1[0]
#> 1

# Assess the third value of x1
# x1[2]
#> 4
# Get the last value of x1
# x1[-1]
#> 4

# Get the second last value of x1
# x1[-2]
#> 6

# To view the output, you can add print statemtents
print(x1[-2])

# In a multidimensional array, we need to specify row and column index.
# Given input array x2:
x2 = np.array([[3, 2, 5, 5],[0, 1, 5, 8], [3, 0, 5, 0]])
#> array([[3, 2, 5, 5],
#>       [0, 1, 5, 8],
#>       [3, 0, 5, 0]])

# Value in 3rd row and 4th column of x2
# x2[2,3]
#> 0

# 3rd row and last value from the 3rd column of x2
# x2[2,-1]
#>0

# Replace value in 1st row and 1st column of x2 with 1
x2[0,0] = 1
#> array([[1,  2,  5,  5],
#>       [ 0,  1,  5,  8],
#>       [ 3,  0,  5,  0]])

x1 = np.arange(10) # Input array
# x1
#> array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

# Get the first 5 elements of x
# x1[:5]
#> array([0, 1, 2, 3, 4])

# Elements after index 4
# x1[4:]
#> array([4, 5, 6, 7, 8, 9])

# From 4th to 6th position
# x1[4:7]
#> array([4, 5, 6])

# Return elements at even place (every other element)
# x1[ : : 2]
#> array([0, 2, 4, 6, 8])

#return elements from 1st position step by 2 (every other element starting at index 1)
# x1[1::2]
#> array([1, 3, 5, 7, 9])

#reverse the array
# x1[::-1]
#> array([9, 8, 7, 6, 5, 4, 3, 2, 1, 0])

# reverse every other element starting from index 5
# x1[5::-2]
# >array([5, 3, 1])

x2 = np.array([[0,1,2], [3,4,5], [6,7,8]])
#> array([[0, 1, 2],
#>        [3, 4, 5],
#>        [6, 7, 8]])

# Extract the first two rows and two columns
# x2[:2, :2]
#> array([[ 0,  1],
#>        [ 3,  4]])

# all rows, every other column
# x2[:3, ::2]
#>array([[0,  2],
#>       [ 3,  5],
#>       [ 6,  8]])

# Reverse only the row positions
# x2[::-1, ]

#> array([[ 6,  7,  8],
#>        [ 3,  4,  5],
#>        [ 0,  1,  2]])

# Reverse the row and column positions
# x2[::-1, ::-1]
#> array([[ 8,  7,  6],
#>        [ 5,  4,  3],
#>        [ 2,  1,  0]])

# Note: Array slices are not copies of the arrays. This means that
# if we want to do a modification on the array obtained from the slicing operation without changing the original array,
# we have to use the copy() method:
# x2_subcopy = x2[::-1, ::-1].copy()

reshaped = np.arange(1, 10).reshape((3, 3))
print(reshaped)

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

np.concatenate([x, y, z])
#> array([ 1,  2,  3,  3,  2,  1, 11, 11, 11])

# We can also concatenate 2-dimensional arrays.
grid = np.array([[1,2,3] , [4,5,6]])
np.concatenate([grid, grid])
#> array([[1, 2, 3],
#>       [4, 5, 6],
#>       [1, 2, 3],
#>       [4, 5, 6]])

x = np.array([3,4,5])
grid = np.array([[1,2,3],[9,10,11]])

np.vstack([x,grid]) # vertically stack the arrays
#> array([[ 3,  4,  5],
#>       [ 1,  2,  3],
#>       [9, 10, 11]])

z = np.array([[19],[19]])
np.hstack([grid,z])  # horizontally stack the arrays
#> array([[ 1,  2,  3, 19],
#>       [9, 10, 11, 19]])

x = np.arange(10)
#> array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

x1, x2, x3 = np.split(x,[3,6])
print(x1, x2, x3)
#> [0 1 2] [3 4 5] [6 7 8 9]

grid = np.arange(16).reshape((4, 4))
print(grid, "\n")

# Split vertically and print upper and lower arrays
upper, lower = np.vsplit(grid, [2])
print(upper)
print(lower, "\n")

# Split horizontally and print left and right arrays
left, right = np.hsplit(grid, [2])
print(left)
print(right)

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
print(np.add(x, 5))
print(np.subtract(x, 5))
print(np.multiply(x, 5))
print(np.divide(x, 5))
print(np.power(x, 2))
print(np.mod(x, 2))

theta = np.linspace(0, np.pi, 4)
print("theta      = ", theta)
print("sin(theta) = ", np.sin(theta))
print("cos(theta) = ", np.cos(theta))
print("tan(theta) = ", np.tan(theta))

x = [1, 2, 3]
print("x     =", x)
print("e^x   =", np.exp(x))
print("2^x   =", np.exp2(x))
print("3^x   =", np.power(3, x))

print("ln(x)    =", np.log(x))
print("log2(x)  =", np.log2(x))
print("log10(x) =", np.log10(x))

x = np.arange(1, 6)
sum_all = np.add.reduce(x)

print(x)
print(sum_all)

x = np.arange(1, 6)
sum_acc = np.add.accumulate(x)

print(x)
print(sum_acc)

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

grid = np.random.random((3, 4))
print(grid)

print("Overall sum:", grid.sum())
print("Overall Min:", grid.min())

# Row wise and column wise min
print("Column wise minimum: ", np.amin(grid, axis=0))
print("Row wise minimum: ", np.amin(grid, axis=1))

x = np.array([1, 2, 3, 4, 5])

print(x < 2) # less than
print(x >= 4) # greater than or equal

x = np.array([1, 2, 3, 4, 5])

# Elements for which multiplying by two is the same as the square of
# the value
# (2 * x) == (x ** 2)
#> array([False,  True, False, False, False], dtype=bool)

x = np.arange(10)
print(x)

# How many values less than 6?
print(np.count_nonzero(x < 6))

# Are there any values greater than 8?
print(np.any(x > 8))

# Are all values less than 10?
print(np.all(x < 10))

# Boolean Masks#
print("----Boolean Mask----------")
# Random integers between [0, 10) of shape 3x3
x = np.random.randint(0, 10, (3, 3))
print(x)

# Boolean array
print(x < 6)

# Boolean mask
print(x[x < 6])