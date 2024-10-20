
const displayInputValues = () => {
  const angleInput = document.getElementById("angle") as HTMLInputElement;
  const forceInput = document.getElementById("force") as HTMLInputElement;

  const angleValueNode = document.getElementById("angleValue");
  if (angleValueNode) {
    angleValueNode.textContent = angleInput.value;
  }

  const forceValueNode = document.getElementById("forceValue");
  if (forceValueNode) {
    forceValueNode.textContent = forceInput.value;
  }
};

const increaseHitballCount  = () => {
  const hitBallCount = document.getElementById(
    "hitBallCount"
  ) as HTMLDivElement;

  hitBallCount.textContent = `${Number(hitBallCount.textContent) + 1}`;

};

export { displayInputValues, increaseHitballCount };
