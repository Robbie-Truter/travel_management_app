function spiralMatrix(matrix) {
  let newArr = [];

  const matrixCopy = [...matrix];

  matrix?.forEach((list, index) => {
    const isFirstRow = index === 0;
    const isLastRow = matrix.length === index + 1;

    if (isFirstRow) {
      newArr = [...newArr, ...list];
      matrixCopy.shift();
    } else {
      list.forEach((listItem, itemIndex) => {
        const isLastItemInRow = list.length === itemIndex + 1;

        if (isLastItemInRow) {
          newArr.push(listItem);
          //matrixCopy[index - 1].pop();
        }

        if (isLastRow) {
        } else {
        }
      });
    }
  });

  console.log(matrixCopy);
  console.log(newArr);
  return newArr;
}

spiralMatrix([
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
]);
