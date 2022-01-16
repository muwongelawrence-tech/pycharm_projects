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