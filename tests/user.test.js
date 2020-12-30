import { getFirstName, isValidPassword } from '../src/utils/user'

test('should return first name when given full name', () => {
  const result = getFirstName('Grega Lasnibat')
  expect(result).toBe('Grega')
})

test('should return first name when given first name', () => {
  const result = getFirstName('Grega')
  expect(result).toBe('Grega')
})

test('should reject password shorter than 8 characters', () => {
  const result = isValidPassword('abc123')
  expect(result).toBe(false)
})

test('should reject password that contains the word "password"', () => {
  const result = isValidPassword('password')
  expect(result).toBe(false)
})

test('should validate a valid password', () => {
  const result = isValidPassword('thisisavalidpass')
  expect(result).toBe(true)
})
