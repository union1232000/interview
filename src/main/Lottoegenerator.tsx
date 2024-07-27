import React, { ChangeEvent, CSSProperties, useState } from "react";

const LottoGenerator: React.FC = () => {
  const [numSets, setNumSets] = useState<number>(1);
  const [setLength, setSetLength] = useState<number>(5);
  const [distinctOrder, setDistinctOrder] = useState<boolean>(true);
  const [excludeNumbers, setExcludeNumbers] = useState<boolean>(false);
  const [excludedNumbers, setExcludedNumbers] = useState<number[]>([]);
  const [results, setResults] = useState<number[][] | null>(null);
  const [error, setError] = useState<string>("");
  const [error2, setError2] = useState<string>("");

  const handleGenerate = () => {
    const maxNumber = 5;
    const validExcludedNumbers = excludedNumbers.filter(
      (num) => num >= 0 && num <= maxNumber
    );

    // Kiểm tra tính khả thi
    const availableNumbers = maxNumber + 1 - validExcludedNumbers.length;
    if (setLength > availableNumbers) {
      setError("Độ dài dãy số không thể lớn hơn số lượng số khả dụng.");
      return;
    }

    let generatedSets: Set<string> = new Set();
    const maxAttempts = 10000;
    let attempts = 0;

    while (generatedSets.size < numSets && attempts < maxAttempts) {
      let set: number[] = [];

      while (set.length < setLength) {
        let num = Math.floor(Math.random() * (maxNumber + 1));
        if (!validExcludedNumbers.includes(num) && !set.includes(num)) {
          set.push(num);
        }
      }

      if (distinctOrder) {
        set.sort((a, b) => a - b);
      }

      const countMap = new Map<number, number>();
      for (const num of set) {
        countMap.set(num, (countMap.get(num) || 0) + 1);
      }
      const countString = Array.from(countMap.entries())
        .map(([num, count]) => `${num}:${count}`)
        .join(",");

      const isDuplicate = generatedSets.has(countString);

      if (!isDuplicate) {
        generatedSets.add(countString);
      }

      attempts++;
    }

    if (generatedSets.size < numSets) {
      setError(
        "Không thể tạo đủ số lượng dãy số theo yêu cầu. Vui lòng điều chỉnh các tham số."
      );
    } else {
      setError("");

      setResults(
        Array.from(generatedSets).map((countString) => {
          const countMap = new Map<number, number>();
          countString.split(",").forEach((pair) => {
            const [num, count] = pair.split(":").map(Number);
            countMap.set(num, count);
          });
          const set: number[] = [];
          countMap.forEach((count, num) => {
            for (let i = 0; i < count; i++) {
              set.push(num);
            }
          });
          return set;
        })
      );
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const split = event.target.value.split(",").map((n) => parseInt(n.trim()));
    const isError = split.some((a) => a < 0 || a > 25);
    if (isError) {
      setError("Giá trị phải từ 0 đến 25");
    } else {
      setError("");
    }
    setExcludedNumbers(split);
  };

  const handleNumberInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    setValue: React.Dispatch<React.SetStateAction<number>>
  ) => {
    setValue(parseInt(e.target.value));
    setError("");
  };
  const handleNumberLengthofEach = (
    e: ChangeEvent<HTMLInputElement>,
    setValue: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const split = e.target.value.split(",");
    const isError = split.some((a) => parseInt(a) <= 4 || parseInt(a) >= 19);
    if (isError) {
      setError2("Giá trị phải từ 5 đến 18");
    } else {
      setError2("");
    }
    setValue(parseInt(e.target.value));
  };
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Lotto Generator</h1>
      <div style={styles.formGroup}>
        <label style={styles.label}>Number of Sets:</label>
        <input
          type="number"
          min="1"
          value={numSets}
          onChange={(e) => handleNumberInputChange(e, setNumSets)}
          style={styles.input}
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Length of Each Set (5-18):</label>
        <input
          type="number"
          min="5"
          max="18"
          value={setLength}
          onChange={(e) => handleNumberLengthofEach(e, setSetLength)}
          style={styles.input}
        />
        {error2 && <p style={{ color: "red" }}>{error2}</p>}
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Distinct Order:</label>
        <input
          type="checkbox"
          checked={distinctOrder}
          onChange={(e) => setDistinctOrder(e.target.checked)}
          style={styles.checkbox}
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Exclude Numbers:</label>
        <input
          type="checkbox"
          checked={excludeNumbers}
          onChange={(e) => setExcludeNumbers(e.target.checked)}
          style={styles.checkbox}
        />
        {excludeNumbers && (
          <input
            type="text"
            placeholder="e.g., 1,6,25"
            onBlur={(e) =>
              setExcludedNumbers(
                e.target.value.split(",").map((n) => parseInt(n.trim()))
              )
            }
            onChange={handleChange}
            style={styles.input}
          />
        )}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
      <button
        disabled={!!error || !!error2}
        onClick={handleGenerate}
        style={{
          ...styles.button,
          ...(error || error2 ? styles.buttonDisabled : {}),
        }}
      >
        Generate
      </button>
      {results && (
        <div style={styles.results}>
          <h2>Results:</h2>
          {results.map((set, index) => (
            <div key={index} style={styles.resultSet}>
              {set.join(", ")}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
const styles: { [key: string]: CSSProperties } = {
  container: {
    fontFamily: "Arial, sans-serif",
    margin: "20px auto",
    padding: "20px",
    maxWidth: "600px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#f9f9f9",
  },
  title: {
    textAlign: "center",
    color: "#333",
  },
  formGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    color: "#555",
  },
  input: {
    width: "100%",
    padding: "8px",
    fontSize: "16px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
  checkbox: {
    margin: "0 10px",
  },
  button: {
    display: "block",
    width: "100%",
    padding: "10px",
    fontSize: "18px",
    color: "#fff",
    backgroundColor: "#007bff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  results: {
    marginTop: "20px",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    backgroundColor: "#fff",
  },
  resultSet: {
    marginBottom: "5px",
    padding: "8px",
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
  },
  buttonDisabled: {
    backgroundColor: "grey",
    cursor: "not-allowed",
  },
};

export default LottoGenerator;
