// @ts-ignore - naughty-words may not have perfect TypeScript support
let BASE_BAD_WORDS: string[] = []

// Try to import naughty-words, fallback to basic list if it fails
try {
  const { en } = require('naughty-words')
  BASE_BAD_WORDS = en
} catch (error) {
  console.warn('naughty-words import failed, using fallback list:', error)
  // Fallback to a basic list of inappropriate words
  BASE_BAD_WORDS = [
    'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'cock', 'cunt',
    'faggot', 'nigger', 'nigga', 'whore', 'slut', 'bastard', 'motherfucker'
  ]
}

// Simplified character substitution mapping (most common ones only)
const CHAR_SUBSTITUTIONS: { [key: string]: string[] } = {
  'a': ['@', '4'],
  'e': ['3'],
  'i': ['1', '!', '|'],
  'o': ['0'],
  's': ['5', '$'],
  't': ['7', '+'],
  'l': ['|', '1'],
  'u': ['v'] // common typo
}

// Calculate simple edit distance (simplified Levenshtein)
function simpleEditDistance(str1: string, str2: string): number {
  if (Math.abs(str1.length - str2.length) > 2) return 99 // too different
  
  let differences = 0
  const maxLen = Math.max(str1.length, str2.length)
  
  for (let i = 0; i < maxLen; i++) {
    if (str1[i] !== str2[i]) {
      differences++
      if (differences > 2) return 99 // too many differences
    }
  }
  
  return differences
}

// Generate simple variations for a word (limited to avoid performance issues)
function generateSimpleVariations(word: string): string[] {
  const variations = new Set([word])
  
  // Character substitutions (only single character)
  for (let i = 0; i < word.length; i++) {
    const char = word[i].toLowerCase()
    const substitutes = CHAR_SUBSTITUTIONS[char] || []
    
    substitutes.forEach(sub => {
      const variation = word.substring(0, i) + sub + word.substring(i + 1)
      variations.add(variation.toLowerCase())
    })
  }
  
  // Simple character transpositions (adjacent chars only)
  for (let i = 0; i < word.length - 1; i++) {
    const chars = word.split('')
    ;[chars[i], chars[i + 1]] = [chars[i + 1], chars[i]]
    variations.add(chars.join('').toLowerCase())
  }
  
  return Array.from(variations)
}

// Text normalization function
function normalizeText(text: string): string {
  return text
    .normalize("NFD")                     // Separate accents
    .replace(/[\u0300-\u036f]/g, "")     // Remove accents
    .replace(/[^a-zA-Z0-9 ]/g, " ")      // Replace symbols with spaces
    .replace(/\s+/g, " ")                // Collapse multiple spaces
    .toLowerCase()
    .trim()
}

// Enhanced direct word detection with simple fuzzy matching
function hasDirectBadWords(text: string): { found: boolean; type: string; word?: string } {
  const normalizedText = normalizeText(text)
  const words = normalizedText.split(/\s+/)
  
  for (const badWord of BASE_BAD_WORDS) {
    const badWordLower = badWord.toLowerCase()
    
    // Check each word in the text
    for (const word of words) {
      // Exact match
      if (word === badWordLower) {
        return { found: true, type: 'direct_match', word: badWord }
      }
      
      // Simple variations check
      const variations = generateSimpleVariations(badWordLower)
      if (variations.includes(word)) {
        return { found: true, type: 'variation_match', word: badWord }
      }
      
             // Simple edit distance check (1-2 character difference)
       if (word.length >= 3 && Math.abs(word.length - badWordLower.length) <= 2) {
         const distance = simpleEditDistance(word, badWordLower)
         if (distance <= 2) {
           return { found: true, type: 'fuzzy_match', word: badWord }
         }
       }
       
       // Check for character deletion patterns (like "fck" vs "fuck")
       if (word.length >= 3 && badWordLower.length > word.length) {
         for (let i = 0; i < badWordLower.length; i++) {
           const withDeleted = badWordLower.substring(0, i) + badWordLower.substring(i + 1)
           if (withDeleted === word) {
             return { found: true, type: 'deletion_match', word: badWord }
           }
         }
       }
    }
  }
  
  return { found: false, type: '' }
}

// Enhanced patterns for obfuscated words (improved)
const OBFUSCATION_PATTERNS = [
  // Common obfuscations (with optional characters)
  /f[\W_]*u?[\W_]*c[\W_]*k/gi,  // catches "fck" and "fuck"
  /s[\W_]*h[\W_]*i[\W_]*t/gi,
  /b[\W_]*i[\W_]*t[\W_]*c[\W_]*h/gi,
  /a[\W_]*s[\W_]*s[\W_]*h[\W_]*o[\W_]*l[\W_]*e/gi,
  
  // Leet speak
  /f[u@4]*ck/gi,
  /sh[i1!]t/gi,
  /[a@4]ss[h#]ole/gi,
  
  // Character separated (more flexible)
  /f[\s\.\-_]{0,3}u?[\s\.\-_]{0,3}c[\s\.\-_]{0,3}k/gi,
  /s[\s\.\-_]{0,3}h[\s\.\-_]{0,3}i[\s\.\-_]{0,3}t/gi,
  
  // Word boundary breaking patterns
  /f[\s\w]*ab[\s\w]*itch/gi,  // catches "f ab itch"
  /b[\s\w]*itch/gi,           // catches "b itch"
  /f[\s\w]*uck/gi,            // catches "f uck"
  
  // More sophisticated patterns
  /fck[\s]*u/gi,              // catches "fck u"
  /f[\s]*ck/gi,               // catches "f ck"
  
  // Reversed
  /kcuf/gi,
  /tihs/gi,
  /hctib/gi,
]

// Check for word boundary breaking (like "f ab itch")
function hasWordBoundaryBreaking(text: string): { found: boolean; type: string } {
  // Remove spaces and check if it forms a bad word
  const compressed = text.replace(/\s+/g, '').toLowerCase()
  
  // Check common boundary breaking patterns (more precise)
  const boundaryPatterns = [
    /f\s+ab\s+itch/gi,                      // "f ab itch" exactly
    /f\s*\w{0,2}\s*ab\s*\w{0,2}\s*itch/gi, // "f [letters] ab [letters] itch" 
    /b\s+itch/gi,                           // "b itch" exactly
    /f\s+uck/gi,                            // "f uck" exactly
    /sh\s+it\b/gi,                          // "sh it" (with word boundary)
    /fck\s+u\b/gi,                          // "fck u" exactly
  ]
  
  for (const pattern of boundaryPatterns) {
    if (pattern.test(text)) {
      return { found: true, type: 'boundary_breaking' }
    }
  }
  
  // Check if compressed text contains bad words
  for (const badWord of BASE_BAD_WORDS) {
    if (compressed.includes(badWord.toLowerCase()) && compressed.length <= badWord.length + 3) {
      return { found: true, type: 'compressed_match' }
    }
  }
  
  return { found: false, type: '' }
}

// Check for obfuscated patterns
function hasObfuscatedWords(text: string): { found: boolean; type: string } {
  for (const pattern of OBFUSCATION_PATTERNS) {
    if (pattern.test(text)) {
      return { found: true, type: 'obfuscated_match' }
    }
  }
  
  // Check word boundary breaking
  const boundaryCheck = hasWordBoundaryBreaking(text)
  if (boundaryCheck.found) {
    return boundaryCheck
  }
  
  return { found: false, type: '' }
}

// Check for spam patterns
function hasSpamPatterns(text: string): { found: boolean; type: string } {
  // Repetitive words
  const repeatedWords = text.match(/\b(\w+)\s+\1\b/gi)
  if (repeatedWords && repeatedWords.length > 3) {
    return { found: true, type: 'repeated_words' }
  }
  
  // Repetitive characters
  const repeatedChars = text.match(/(.)\1{4,}/g)
  if (repeatedChars) {
    return { found: true, type: 'repeated_chars' }
  }
  
  return { found: false, type: '' }
}

// Main moderation function (simplified but enhanced)
export function moderateContent(text: string): {
  isClean: boolean
  reason?: string
  severity: 'clean' | 'soft' | 'hard'
  detectionType?: string
  detectedWord?: string
} {
  try {
    // Check direct bad words with simple fuzzy matching
    const directCheck = hasDirectBadWords(text)
    if (directCheck.found) {
      return {
        isClean: false,
        reason: 'Contains inappropriate language',
        severity: 'hard',
        detectionType: directCheck.type,
        detectedWord: directCheck.word
      }
    }
    
    // Check obfuscated words
    const obfuscatedCheck = hasObfuscatedWords(text)
    if (obfuscatedCheck.found) {
      return {
        isClean: false,
        reason: 'Contains disguised inappropriate language',
        severity: 'hard',
        detectionType: obfuscatedCheck.type
      }
    }
    
    // Check spam patterns
    const spamCheck = hasSpamPatterns(text)
    if (spamCheck.found) {
      return {
        isClean: false,
        reason: 'Contains repetitive spam patterns',
        severity: 'soft',
        detectionType: spamCheck.type
      }
    }
    
    // Check excessive caps
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length
    if (capsRatio > 0.6 && text.length > 20) {
      return {
        isClean: false,
        reason: 'Excessive capitalization detected',
        severity: 'soft',
        detectionType: 'excessive_caps'
      }
    }
    
    return {
      isClean: true,
      severity: 'clean'
    }
  } catch (error) {
    // Fallback to basic check if enhanced fails
    console.error('Enhanced moderation failed, falling back to basic:', error)
    
    const basicWords = text.toLowerCase().split(/\s+/)
    for (const word of basicWords) {
      if (BASE_BAD_WORDS.includes(word)) {
        return {
          isClean: false,
          reason: 'Contains inappropriate language',
          severity: 'hard',
          detectionType: 'basic_fallback'
        }
      }
    }
    
    return {
      isClean: true,
      severity: 'clean'
    }
  }
}

// Academic context detector
export function isAcademicContext(text: string): boolean {
  const academicTerms = [
    'research', 'analysis', 'methodology', 'data', 'study', 'experiment',
    'publication', 'paper', 'thesis', 'dissertation', 'laboratory', 'project',
    'collaboration', 'supervision', 'mentoring', 'academic', 'scientific'
  ]
  
  const lowerText = text.toLowerCase()
  const academicWordCount = academicTerms.filter(term => 
    lowerText.includes(term)
  ).length
  
  // Consider it academic if it has 2+ academic terms
  return academicWordCount >= 2
} 