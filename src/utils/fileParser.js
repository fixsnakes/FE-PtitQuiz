import mammoth from "mammoth";

/**
 * Parse Word (.docx) file and extract text content
 * @param {File} file - Word file object
 * @returns {Promise<string>} Extracted text content
 */
export async function parseWord(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error("Error parsing Word:", error);
    throw new Error("Không thể đọc file Word. Vui lòng kiểm tra lại file.");
  }
}

/**
 * Parse Word file
 * @param {File} file - File object (must be .docx)
 * @returns {Promise<string>} Extracted text content
 */
export async function parseFile(file) {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  if (
    fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.endsWith(".docx")
  ) {
    return await parseWord(file);
  } else if (fileName.endsWith(".doc")) {
    throw new Error(
      "File .doc không được hỗ trợ. Vui lòng chuyển đổi sang .docx."
    );
  } else {
    throw new Error(
      "Định dạng file không được hỗ trợ. Vui lòng chọn file Word (.docx)."
    );
  }
}

/**
 * Convert extracted text to the format expected by the question parser
 * This function tries to identify questions and answers from the text
 * Format: Question and answers are on consecutive lines, only empty line between questions
 * @param {string} text - Raw text from file
 * @returns {string} Formatted text ready for parsing
 */
export function formatTextForQuestions(text) {
  if (!text || typeof text !== "string") {
    return "";
  }

  // Split by lines and clean
  const lines = text.split(/\r?\n/).map((line) => line.trim());
  const formattedLines = [];
  let currentQuestion = null;
  let questionStarted = false;
  let hasPreviousQuestion = false; // Track if we've added a complete question block

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = i < lines.length - 1 ? lines[i + 1] : "";

    // Skip empty lines at the beginning
    if (!line && formattedLines.length === 0) {
      continue;
    }

    // Check if line is a question number (e.g., "Câu 1:", "Question 1:", "1.")
    const questionPattern = /^(Câu\s*\d+[:\s]+|Question\s*\d+[:\s]+|\d+[\.\)]\s+)(.+)$/i;
    const questionMatch = line.match(questionPattern);

    if (questionMatch) {
      // If we have a previous complete question block, add separator before new question
      if (hasPreviousQuestion && formattedLines.length > 0) {
        formattedLines.push("");
      }
      // Start new question
      currentQuestion = questionMatch[2] || line.replace(/^(Câu\s*\d+[:\s]+|Question\s*\d+[:\s]+|\d+[\.\)]\s+)/i, "");
      questionStarted = true;
      hasPreviousQuestion = false; // Reset until we complete this question
      continue;
    }

    // Check if line is an answer option (A., B., C., D., etc.)
    const answerPattern = /^([A-Z])[\.\)]\s*(.+)$/i;
    const answerMatch = line.match(answerPattern);

    if (answerMatch) {
      // If we have a current question, add it first (without empty line before it)
      if (questionStarted && currentQuestion) {
        formattedLines.push(currentQuestion);
        currentQuestion = null;
        questionStarted = false;
      }
      // Normalize answer format to "A. " format and add immediately after question
      const normalizedAnswer = `${answerMatch[1].toUpperCase()}. ${answerMatch[2]}`;
      formattedLines.push(normalizedAnswer);
      hasPreviousQuestion = true; // Mark that we have a complete question block
      continue;
    }

    // Handle non-empty lines
    if (line.length > 0) {
      if (questionStarted && currentQuestion) {
        // Check if next line is an answer
        const nextIsAnswer = /^[A-Z][\.\)]\s*/i.test(nextLine);
        if (nextIsAnswer) {
          // This is the last line of the question
          currentQuestion += " " + line;
        } else {
          // Continue building the question
          currentQuestion += " " + line;
        }
      } else {
        // Check if previous line was an answer
        const lastLine = formattedLines[formattedLines.length - 1];
        if (lastLine && /^[A-Z]\.\s*/i.test(lastLine)) {
          // Append to last answer (multi-line answer) - no line break
          formattedLines[formattedLines.length - 1] += " " + line;
        } else {
          // Might be a question without number prefix
          // Add separator only if we have a previous complete question
          if (hasPreviousQuestion && formattedLines.length > 0) {
            formattedLines.push("");
          }
          // Check if this looks like a question
          if (line.length > 10 && !/^[A-Z]\.\s*/i.test(line)) {
            currentQuestion = line;
            questionStarted = true;
            hasPreviousQuestion = false;
          } else {
            formattedLines.push(line);
          }
        }
      }
    } else {
      // Empty line - if we have a question in progress, it might be the end
      // But we don't finalize it here, wait for answers or next question
      // This empty line will be handled when we encounter next question or answer
    }
  }

  // Add last question if exists (without answers)
  if (questionStarted && currentQuestion) {
    // Add separator if we have previous content
    if (hasPreviousQuestion && formattedLines.length > 0) {
      formattedLines.push("");
    }
    formattedLines.push(currentQuestion);
  }

  // Clean up and return
  let result = formattedLines.join("\n").trim();

  // Remove excessive empty lines (more than 1 consecutive empty line)
  result = result.replace(/\n{3,}/g, "\n\n");

  return result;
}
