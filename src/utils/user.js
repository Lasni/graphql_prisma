const getFirstName = (fullname) => {
  return fullname.split(' ')[0]
}

const isValidPassword = (password) => {
  return password.length >= 8 && !password.toLowerCase().includes('password')
}

export { getFirstName, isValidPassword }
