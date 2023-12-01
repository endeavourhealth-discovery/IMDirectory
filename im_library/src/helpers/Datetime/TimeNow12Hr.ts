export function timeNow12Hr() {
  let newDate = new Date();
  return convertHoursTo12Hr(newDate) + ":" + getMinutes(newDate) + ":" + getSeconds(newDate) + getMeridiemIndicator(newDate);
}

function convertHoursTo12Hr(date: Date) {
  let hours = date.getHours();
  let convertedHours = date.getHours() < 10 ? "0" : "";
  if (hours > 12) {
    if (hours - 12 > 9) {
      return convertedHours + (hours - 12);
    } else {
      return convertedHours + "0" + (hours - 12);
    }
  } else {
    return convertedHours + hours;
  }
}

function getMinutes(date: Date) {
  return (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
}

function getSeconds(date: Date) {
  return (date.getSeconds() < 10 ? "0" : "") + date.getSeconds();
}

function getMeridiemIndicator(date: Date) {
  return date.getHours() > 12 ? "PM" : "AM";
}
