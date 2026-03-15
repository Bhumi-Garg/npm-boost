import ora from 'ora';

let activeSpinner = null;

export function startSpinner(text) {
  activeSpinner = ora({ text, color: 'cyan' }).start();
  return activeSpinner;
}

export function stopSpinner(success = true, text = '') {
  if (!activeSpinner) return;
  if (success) {
    activeSpinner.succeed(text || activeSpinner.text);
  } else {
    activeSpinner.fail(text || activeSpinner.text);
  }
  activeSpinner = null;
}

export function updateSpinner(text) {
  if (activeSpinner) activeSpinner.text = text;
}