const app_log = true; // set false in production

const function_log = true; // set false in production

const ui_log = true; // set false in production

// ------------------------------------------------------------------------------------------------

export function getTime() {
  const now = new Date();
  return now.toLocaleTimeString()
}


export function logger(log){
  if (Array.isArray(log)) {
    console.log(`${getTime()} - :`, log);
  } else if (typeof log === 'string') {
    console.log(`${getTime()} - : ${log}`);
  } else {
    // Handle other types if necessary
    console.log(`${getTime()} - :`, log);
  }
}


export function appLog(log) {
  logger(log)
}


export function functionLog(log) {
  logger(log)
}


export function uiLog(log) {
  logger(log)
}
