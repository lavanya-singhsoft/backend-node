const validateMobile = (str, len = 10) => {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(str) && str.length === len;
};

const validateEmail = (str) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str);
};

const validate_pan = (str) => {
  const electricityRegex = /^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/;
  return electricityRegex.test(str);
};

const validateVehicleRegNumber = (str) => {
  const regNumberRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;
  return regNumberRegex.test(str);
};

const validateAccountNumber = (str) => {
  const accountRegex = /^\d{6,}$/;
  return accountRegex.test(str);
};

const validateDOB = (str) => {
  const dOBRegex = /^(0[1-9]|[12][0-9]|3[01])[-/.](0[1-9]|1[0-2])[-/.](19|20)\d{2}$/;
  if (!dOBRegex.test(str)) {
    return false;
  }

  const parts = str.split(/[-/.]/);
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

const validateID = (id) => {
  if (!id) {
    return false;
  }
  if (String(id).length != 36) {
    return false;
  }
  return true;
};

const validators = {
  mobile_number: validateMobile,
  phone: validateMobile,
  email: validateEmail,
  account_number: validateAccountNumber,
  vehicle_registration_number: validateVehicleRegNumber,
  date_of_birth: validateDOB,
  pan_number: validate_pan,
  id: validateID,
  user_id: validateID,
  parent_id: validateID,
  list_id: validateID,
  space_id: validateID,
  workspace_id: validateID,
};

const validatePayload = (fields, values, extraFix = false) => {
  let isValid = true;
  let errors = {};

  fields.forEach((field) => {
    if (!values[field]) {
      isValid = false;
      errors[field] = `${field} field is required`;
    }

    if (extraFix) {
      if (extraFix[field]) {
        if (!extraFix[field].includes(values[field])) {
          isValid = false;
          errors[field] = `${field} only accepts ${extraFix[field]}`;
        }
      }
    }

    if (validators[field]) {
      let validate = validators[field](values[field]);
      if (!validate) {
        isValid = false;
        errors[field] = `invalid value "${values[field]}" for "${field}" field`;
      }
    }
  });

  if (!isValid) {
    return errors;
  }

  return false;
};

const validatePayloadifAvailable = (fields, values, extraFix = false) => {
  let isValid = true;
  let errors = {};

  fields.forEach((field) => {
    if (!values[field]) {
      return false;
    }

    if (extraFix) {
      if (extraFix[field]) {
        if (!extraFix[field].includes(values[field])) {
          isValid = false;
          errors[field] = `${field} only accepts ${extraFix[field]}`;
        }
      }
    }

    if (validators[field]) {
      let validate = validators[field](values[field]);
      if (!validate) {
        isValid = false;
        errors[field] = `invalid value "${values[field]}" for "${field}" field`;
      }
    }
  });

  if (!isValid) {
    return errors;
  }

  return false;
};

function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

module.exports = { validatePayload, isValidURL, validatePayloadifAvailable };
