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