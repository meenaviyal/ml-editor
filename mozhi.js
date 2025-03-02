/**
 * Malayalam Input Library - Mozhi Scheme Implementation
 * Modern rewrite of the original Three-In-One Malayalam Input by Hrishikesh K B
 * 
 * This implementation focuses on the Mozhi transliteration scheme.
 * Based on the original work by Peringz.
 * 
 * This is free software under the GNU Lesser General Public License.
 */

class MozhiInput {
  constructor() {
    // Initialize internal mappings
    this.initMappings();
    
    // Internal state tracking
    this.boundTextInputs = new Map();
    this.stateObjects = new WeakMap();
    this.conversionHash = null;
    this.maxCyrLength = 6;
  }

  /**
   * Initialize the component mappings used to build the conversion hash
   */
  initMappings() {
    // Malayalam consonants
    this.consonants = {
      "ക": "ക", "ഖ": "ഖ", "ഗ": "ഗ", "ഘ": "ഘ", "ങ": "ങ", "ച": "ച", "ഛ": "ഛ",
      "ജ": "ജ", "ഝ": "ഝ", "ഞ": "ഞ", "ട": "ട", "ഠ": "ഠ", "ഡ": "ഡ", "ഢ": "ഢ",
      "ണ": "ണ", "ത": "ത", "ഥ": "ഥ", "ദ": "ദ", "ധ": "ധ", "ന": "ന", "പ": "പ",
      "ഫ": "ഫ", "ബ": "ബ", "ഭ": "ഭ", "മ": "മ", "യ": "യ", "ര": "ര", "ല": "ല",
      "വ": "വ", "ശ": "ശ", "ഷ": "ഷ", "സ": "സ", "ഹ": "ഹ", "ള": "ള", "ഴ": "ഴ",
      "റ": "റ", "റ്റ": "റ്റ"
    };

    // Chillaksharam (consonants without vowel sound)
    this.chillaksharam = {
      "ണ്‍": "ണ", "ന്‍": "ന", "ം": "മ", "ര്‍": "ര", "ല്‍": "ല", "ള്‍": "ള", "്\u200D": ""
    };

    // Vowel mappings
    this.vowels = {
      "്a": "", "്e": "െ", "്i": "ി", "്o": "ൊ", "്u": "ു", "്A": "ാ",
      "്E": "േ", "്I": "ീ", "്O": "ോ", "്U": "ൂ", "്Y": "ൈ", "െe": "ീ",
      "ൊo": "ൂ", "ിi": "ീ", "ിe": "ീ", "ുu": "ൂ", "ുo": "ൂ", "്r": "്ര്"
    };

    // Roman transliteration mappings
    this.roman = {
      "k": "ക്", "ക്h": "ഖ്", "g": "ഗ്", "ഗ്h": "ഘ്", "ന്‍g": "ങ്",
      "c": "ക്\u200D", "ക്\u200Dh": "ച്", "ച്h": "ഛ്", "j": "ജ്", "ജ്h": "ഝ്",
      "ന്‍j": "ഞ്", "ന്‍h": "ഞ്", "T": "ട്", "ട്h": "ഠ്", "D": "ഡ്", "ഡ്h": "ഢ്",
      "റ്റ്h": "ത്", "ത്h": "ഥ്", "d": "ദ്", "ദ്h": "ധ്", "p": "പ്", "പ്h": "ഫ്",
      "f": "ഫ്", "b": "ബ്", "ബ്h": "ഭ്", "y": "യ്", "v": "വ്", "w": "വ്",
      "z": "ശ്", "S": "ശ്", "സ്h": "ഷ്", "s": "സ്", "h": "ഹ്", "ശ്h": "ഴ്",
      "x": "ക്ഷ്", "R": "റ്", "t": "റ്റ്"
    };

    // Chillaksharam mappings
    this.chill = {
      "N": "ണ്‍", "n": "ന്‍", "m": "ം", "r": "ര്‍", "l": "ല്‍", "L": "ള്‍"
    };

    // Swaram (vowel) mappings
    this.swaram = {
      "a": "അ", "അa": "ആ", "A": "ആ", "e": "എ", "E": "ഏ", "എe": "ഈ",
      "i": "ഇ", "ഇi": "ഈ", "ഇe": "ഈ", "അi": "ഐ", "I": "ഐ", "o": "ഒ",
      "ഒo": "ഊ", "O": "ഓ", "അu": "ഔ", "ഒu": "ഔ", "u": "ഉ", "ഉu": "ഊ",
      "U": "ഊ", "H": "ഃ", "റ്h": "ഋ", "ര്‍^": "ഋ", "ഋ^": "ൠ", "ല്‍^": "ഌ", "ഌ^": "ൡ"
    };

    // Numeral mappings
    this.numerals = {
      "1": "൧", "2": "൨", "3": "൩", "4": "൪", "5": "൫", "6": "൬", "7": "൭", "8": "൮", "9": "൯", "0": "൦"
    };

    // Conjunct consonants
    this.conjuncts = {
      "ന്‍t": "ന്റ്", "ന്റ്h": "ന്ത്", "ന്‍k": "ങ്ക്", "ന്‍n": "ന്ന്", "ണ്‍N": "ണ്ണ്",
      "ള്‍L": "ള്ള്", "ല്‍l": "ല്ല്", "ംm": "മ്മ്", "ന്‍m": "ന്മ്", "ന്ന്g": "ങ്ങ്",
      "ന്‍d": "ന്ദ്", "ണ്‍m": "ണ്മ്", "ല്‍p": "ല്പ്", "ംp": "മ്പ്", "റ്റ്t": "ട്ട്",
      "ന്‍T": "ണ്ട്", "ണ്‍T": "ണ്ട്", "്ര്^": "ൃ", "ന്‍c": "ന്‍\u200D", "ന്‍\u200Dh": "ഞ്ച്", "ണ്‍D": "ണ്ഡ്"
    };

    // Other special mappings
    this.others = {
      "്L": "്ല്", "~": "്\u200C", "്~": "്\u200C", "\u200C~": "\u200C", "ം~": "മ്",
      "ക്\u200Dc": "ക്ക്\u200D", "ക്ക്\u200Dh": "ച്ച്", "q": "ക്യൂ"
    };

    // Capital letter mappings
    this.caps = {
      "B": "ബ്ബ്", "C": "ക്ക്\u200D", "F": "ഫ്", "G": "ഗ്ഗ്", "J": "ജ്ജ്", "K": "ക്ക്",
      "M": "മ്മ്", "P": "പ്പ്", "Q": "ക്യൂ", "V": "വ്വ്", "W": "വ്വ്", "X": "ക്ഷ്", "Y": "യ്യ്", "Z": "ശ്ശ്"
    };

    // Zero-width non-joiner
    this.zwnj = {
      "_": "\u200C"
    };
  }

  /**
   * Build the main conversion hash map for all transliteration patterns
   */
  buildConversionHash() {
    if (this.conversionHash !== null) {
      return this.conversionHash;
    }

    // Start with a combined object of all the mappings
    const hash = {
      ...this.vowels,
      ...this.roman,
      ...this.chill,
      ...this.swaram,
      ...this.numerals,
      ...this.conjuncts,
      ...this.others,
      ...this.caps,
      ...this.zwnj
    };

    // Add consonant-vowel combinations
    for (const consonant in this.consonants) {
      hash[`${consonant}a`] = `${consonant}ാ`;
      hash[`${consonant}e`] = `${consonant}േ`;
      hash[`${consonant}i`] = `${consonant}ൈ`;
      hash[`${consonant}o`] = `${consonant}ോ`;
      hash[`${consonant}u`] = `${consonant}ൗ`;
    }

    // Add chillaksharam combinations
    for (const chk in this.chillaksharam) {
      const base = this.chillaksharam[chk];
      
      hash[`${chk}a`] = base;
      hash[`${chk}e`] = `${base}െ`;
      hash[`${chk}i`] = `${base}ി`;
      hash[`${chk}o`] = `${base}ൊ`;
      hash[`${chk}u`] = `${base}ു`;
      hash[`${chk}A`] = `${base}ാ`;
      hash[`${chk}E`] = `${base}േ`;
      hash[`${chk}I`] = `${base}ീ`;
      hash[`${chk}O`] = `${base}ോ`;
      hash[`${chk}U`] = `${base}ൂ`;
      hash[`${chk}Y`] = `${base}ൈ`;
      hash[`${chk}r`] = `${base}്ര്`;
      hash[`${chk}y`] = `${base}്യ്`;
      hash[`${chk}v`] = `${base}്വ്`;
      hash[`${chk}w`] = `${base}്വ്`;
      hash[`${chk}~`] = `${base}്\u200C`;
    }

    this.conversionHash = hash;
    return hash;
  }
  
  /**
   * Initialize the library
   */
  init() {
    // Build the conversion hash
    this.buildConversionHash();
    
    // Set up event listeners for the input method selectors
    this.setupInputMethodSelectors();
  }
  
  /**
   * Set up event listeners for input method selectors
   */
  setupInputMethodSelectors() {
    // Find all input method selectors
    const selectors = document.querySelectorAll('.input-method-selector');
    
    // Add change event listeners
    selectors.forEach(selector => {
      selector.addEventListener('change', () => {
        // Get the associated input element ID
        const inputId = selector.id.replace('inputMethod', 'malayalamInput');
        
        // Find the input element
        let inputElement = document.getElementById(inputId);
        
        // If not found directly, check for single line input
        if (!inputElement && selector.id === 'inputMethod3') {
          inputElement = document.getElementById('singleLineInput');
        }
        
        if (inputElement) {
          if (selector.value === '1') {
            this.enableForInput(inputElement);
          } else {
            this.disableForInput(inputElement);
          }
        }
      });
    });
  }
  
  /**
   * Enable transliteration for a text input
   */
  enableForInput(textInput) {
    if (!textInput) return;
    
    // Initialize state for this element
    this.stateObjects.set(textInput, {
      cyrBuffer: "",
      transBuffer: "",
      position: { start: textInput.selectionStart || 0, end: textInput.selectionEnd || 0 },
      reset: false
    });
    
    // Add keypress handler
    textInput.addEventListener('keypress', this.handleKeypress.bind(this));
    
    // Highlight that the input method is active
    textInput.style.outline = 'dashed 1px green';
    
    // Store in our map of bound elements
    this.boundTextInputs.set(textInput, true);
  }
  
  /**
   * Disable transliteration for a text input
   */
  disableForInput(textInput) {
    if (!textInput) return;
    
    // Remove keypress handler
    textInput.removeEventListener('keypress', this.handleKeypress.bind(this));
    
    // Remove highlighting
    textInput.style.outline = null;
    
    // Remove from our tracking maps
    this.boundTextInputs.delete(textInput);
    this.stateObjects.delete(textInput);
  }
  
  /**
   * Handle keypress events for transliteration
   */
  handleKeypress(event) {
    // Get the text input element
    const textInput = event.target;
    
    // Ignore if modifier keys are pressed
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return true;
    }
    
    // Get the key code
    const keyCode = event.keyCode || event.which;
    
    // Skip control keys except Tab (9)
    if ((keyCode < 32 && keyCode !== 9) || keyCode === 255) {
      return true;
    }
    
    // Get the state object for this input
    const state = this.stateObjects.get(textInput);
    if (!state) return true;
    
    // Check if cursor position has changed
    const currentPos = {
      start: textInput.selectionStart,
      end: textInput.selectionEnd
    };
    
    if (state.position.start !== currentPos.start) {
      // Reset state if cursor moved
      state.reset = true;
    }
    
    // If reset needed, clear state
    if (state.reset) {
      state.cyrBuffer = "";
      state.transBuffer = "";
      state.position = currentPos;
      state.reset = false;
    }
    
    // Get the character
    const char = String.fromCharCode(keyCode);
    
    // Process the transliteration
    const result = this.processTransliteration(state, char);
    
    // If the result is different from the input character or needs replacement
    if (char !== result.out || result.replace > 0) {
      event.preventDefault();
      
      // Replace text in the input
      this.replaceText(textInput, result.out, result.replace);
      
      // Update position
      state.position = {
        start: textInput.selectionStart,
        end: textInput.selectionEnd
      };
    }
    
    return true;
  }
  
  /**
   * Process the transliteration for a character
   */
  processTransliteration(state, char) {
    const result = {
      out: "",
      replace: 0
    };
    
    // Initial backbuffer for maintaining context
    const backbuffer = "";
    const chunks = [];
    
    // Add character to buffer
    state.transBuffer += char;
    
    // Transliterate the buffer
    const str = this.toMalayalam(state.cyrBuffer + char, backbuffer, chunks);
    
    // Remove backbuffer from output
    const output = str.substr(backbuffer.length);
    result.out = output;
    
    // Get the difference between state.cyrBuffer and output
    for (let i = 0; i < Math.min(state.cyrBuffer.length, result.out.length); i++) {
      if (state.cyrBuffer.charAt(i) !== result.out.charAt(i)) {
        result.replace = state.cyrBuffer.length - i;
        result.out = result.out.substr(i);
        break;
      }
    }
    
    if (result.replace === 0) {
      if (result.out.length < state.cyrBuffer.length) {
        result.replace = state.cyrBuffer.length - result.out.length;
      }
      result.out = result.out.substr(Math.min(state.cyrBuffer.length, result.out.length));
    }
    
    // Update state
    if (chunks.length > 0 && chunks[chunks.length - 1] === result.out.substring(result.out.length - 1)) {
      // No conversion occurred, reset state
      state.cyrBuffer = "";
      state.transBuffer = "";
      state.reset = true;
    } else {
      // Update buffers, trimming if too long
      while (state.transBuffer.length > this.maxCyrLength) {
        state.transBuffer = state.transBuffer.substr(chunks[0].length);
        chunks.shift();
        str = str.substr(1);
      }
      state.cyrBuffer = str;
    }
    
    return result;
  }
  
  /**
   * Transliterate text to Malayalam using Mozhi scheme
   */
  toMalayalam(src, output = '', chunks = []) {
    if (!src) return src;
    
    const hash = this.buildConversionHash();
    let location = 0;
    
    while (location < src.length) {
      let len = Math.min(this.maxCyrLength, src.length - location);
      let arr = undefined;
      let sub;
      
      // Find the longest matching substring
      while (len > 0) {
        sub = src.substr(location, len);
        arr = hash[sub];
        if (arr !== undefined) break;
        len--;
      }
      
      // For transliteration tracking
      if (chunks) chunks.push(sub);
      
      if (arr === undefined) {
        // No match found, use the original character
        output += sub;
        location++;
      } else {
        // Match found, handle case sensitivity
        const newChar = arr;
        
        // Case analysis (largely following the original implementation)
        if (sub.toLowerCase() === sub.toUpperCase() && 
            arr.length > 1 && arr[1] && 
            (newChar.toUpperCase() !== newChar.toLowerCase())) {
          
          // Case handling for caseless input characters
          const prevCh = output.length === 0 ? null : output.substr(output.length - 1, 1);
          const prevDud = !prevCh || !this.getTranslitString(prevCh);
          const prevCap = (!prevDud && prevCh === prevCh.toUpperCase());
          
          if (prevDud || !prevCap) {
            output += newChar.toLowerCase();
          } else {
            const next = location + len < src.length ? src.substr(location + len, 1) : " ";
            
            if (next !== next.toUpperCase() && next === next.toLowerCase()) {
              // Next is lowercase
              output += newChar.toLowerCase();
            } else if (next === next.toUpperCase() && next !== next.toLowerCase()) {
              // Next is uppercase
              output += newChar.toUpperCase();
            } else {
              // Next is caseless, check previous character
              const pprevCh = output.length === 1 ? null : output.substr(output.length - 2, 1);
              const pprevDud = !pprevCh || !this.getTranslitString(pprevCh);
              
              output += (!pprevDud && pprevCh === pprevCh.toUpperCase()) ? 
                newChar.toUpperCase() : newChar.toLowerCase();
            }
          }
        } else if ((sub.toLowerCase() === sub.toUpperCase()) && (arr.length < 2 || !arr[1])) {
          // Literal treatment
          output += newChar;
        } else if (sub !== sub.toLowerCase()) {
          // Not all lowercase
          output += newChar.toUpperCase();
        } else {
          // All lowercase
          output += newChar.toLowerCase();
        }
        
        location += len;
      }
    }
    
    return output;
  }
  
  /**
   * Get transliteration string for a character (needed for case analysis)
   */
  getTranslitString(ch) {
    const hash = this.buildConversionHash();
    for (const [key, value] of Object.entries(hash)) {
      if (value === ch) return key;
    }
    return null;
  }
  
  /**
   * Replace text in an input element
   */
  replaceText(element, text, stepsBack = 0) {
    if (!element) return;
    
    const start = element.selectionStart - stepsBack;
    const end = element.selectionEnd;
    const scrollTop = element.scrollTop;
    
    // Insert the new text
    element.value = 
      element.value.substring(0, start) + 
      text + 
      element.value.substring(end);
    
    // Restore scroll position
    element.scrollTop = scrollTop;
    
    // Set cursor position after the inserted text
    const newPosition = start + text.length;
    element.selectionStart = newPosition;
    element.selectionEnd = newPosition;
  }
}

// Create a singleton instance
const mozhiInput = new MozhiInput();

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  mozhiInput.init();
});
