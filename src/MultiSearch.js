import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

const MultiSearch = ({
  data,
  width = null,
  primaryColor = "#adf09f",
  secondaryColor = "#e8f3f1",
  removeButtonColor = "#cfee8e",
  placeholderText = "Search",
  onFilter,
}) => {
  const mainInputRef = useRef(null);
  const inputRefs = useRef({});
  const dropdownRef = useRef(null);
  const currentOptionRef = useRef(null);

  const setRef = (key, element) => {
    if (element) {
      inputRefs.current[key] = element;
    }
  };

  const [selectedFilters, setSelectedFilters] = useState([]);

  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [currentOption, setCurrentOption] = useState(0);

  const [inputValues, setInputValues] = useState({});
  const [outputValues, setOutputValues] = useState({});

  const [currentFilter, setCurrentFilter] = useState(null);

  useEffect(() => {
    onFilter(outputValues);
  }, [outputValues]);

  const handleKeyDown = useCallback(
    (e) => {
      if (dropdownOptions.length < 1) {
        return;
      }
      if (e.keyCode === 40)
        // ArrowDown
        setCurrentOption((prev) => {
          return dropdownOptions.length - 1 === prev ? 0 : prev + 1;
        });
      if (e.keyCode === 38)
        // ArrowUp
        setCurrentOption((prev) => {
          return prev === 0 ? dropdownOptions.length - 1 : prev - 1;
        });
      if (e.keyCode === 13) {
        // Enter
        const filterInfo = dropdownOptions[currentOptionRef.current];
        handleOptionSelect(filterInfo, filterInfo.key);
      }
    },
    [dropdownOptions]
  );

  useEffect(() => {
    currentOptionRef.current = currentOption;
  }, [currentOption]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dropdownOptions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOptions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionSelect = useCallback(
    (filter, filterKey) => {
      if (filterKey) {
        setSelectedFilters((filters) => [...filters, filter]);
      } else {
        setInputValues((inputs) => ({
          ...inputs,
          [currentFilter]: filter,
        }));
      }
    },
    [currentFilter]
  );

  const handleDropdownFilter = useCallback(
    (e, filterData, global = false) => {
      const input = e.target.value.trim();
      const filtered = filterData.filter((option) => {
        return (option.label || option)
          .toLowerCase()
          .includes(input.toLowerCase());
      });
      if (global) {
        const result = filtered.filter(
          (option) =>
            !selectedFilters.some((filter) => option.key === filter.key)
        );
        setDropdownOptions(result);
      } else {
        setDropdownOptions(filtered);
      }
    },
    [selectedFilters]
  );

  const updateOutputValues = useCallback(
    (globalKey, globalValue, removeFilter) => {
      if (removeFilter) {
        const removed = { ...outputValues };
        delete removed[globalKey];
        setOutputValues(removed);
        return;
      }
      if (outputValues.hasOwnProperty(globalKey)) {
        const updated = { ...outputValues };
        updated[globalKey] = globalValue;
        setOutputValues(updated);
      } else {
        setOutputValues((outputs) => ({
          ...outputs,
          [globalKey]: globalValue,
        }));
      }
    },
    [outputValues]
  );

  const handleRemoveFilter = useCallback(
    (filterKey) => {
      const filtered = selectedFilters.filter(
        (filter) => filter.key !== filterKey
      );
      setSelectedFilters(filtered);

      setInputValues((inpVals) =>
        Object.fromEntries(
          Object.entries(inpVals).filter(([key]) => key !== filterKey)
        )
      );

      updateOutputValues(filterKey, null, true);
    },
    [selectedFilters, updateOutputValues]
  );

  const renderFilters = (filter) => {
    switch (filter.type) {
      case "text":
        return (
          <input
            className="input-text"
            ref={(el) => setRef(filter.key, el)}
            type="text"
            onFocus={() => {
              setDropdownOptions([]);
            }}
            onKeyDown={(e) =>
              e.code === "Enter" &&
              updateOutputValues(filter.key, e.target.value)
            }
            style={{ background: secondaryColor }}
          />
        );
      case "dropdown":
        return (
          <input
            className="input-text"
            ref={(el) => setRef(filter.key, el)}
            type="text"
            onFocus={(e) => {
              setCurrentFilter(filter.key);
              handleDropdownFilter(e, filter.options);
            }}
            onChange={(e) => {
              setInputValues((inputs) => ({
                ...inputs,
                [filter.key]: e.target.value,
              }));
              handleDropdownFilter(e, filter.options);
            }}
            value={inputValues[filter.key] || ""}
            style={{ background: secondaryColor }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="container"
      style={{ width: width, border: `1px solid ${primaryColor}` }}
    >
      {selectedFilters.map((filter) => {
        return (
          <div
            className="filter"
            key={filter.key}
            style={{ background: primaryColor }}
          >
            <span className="filter-label">{filter.label}</span>
            {renderFilters(filter)}
            <button
              className="remove-button"
              onClick={() => handleRemoveFilter(filter.key)}
              style={{ background: removeButtonColor }}
            >
              &times;
            </button>
          </div>
        );
      })}

      <input
        ref={mainInputRef}
        className="global-filter-input"
        type="text"
        onFocus={(e) => handleDropdownFilter(e, data, true)}
        onChange={(e) => handleDropdownFilter(e, data, true)}
        placeholder={placeholderText}
      />

      <div ref={dropdownRef} className="dropdown">
        {dropdownOptions.map((option, index) => {
          return (
            <li
              className={
                currentOption === index
                  ? "selected dropdown-option"
                  : "dropdown-option"
              }
              key={option.key || option}
              onClick={() => {
                if (option.key) {
                  mainInputRef.current.value = "";
                  if (option.type === "boolean") {
                    updateOutputValues(option.key, true);
                  } else {
                    setTimeout(() => {
                      inputRefs.current[option.key].focus();
                    }, 0);
                  }
                } else {
                  updateOutputValues(currentFilter, option);
                }
                setDropdownOptions([]);
                handleOptionSelect(option, option.key);
              }}
              style={{ "--hover-color": primaryColor }}
            >
              {option.label || option}
              {option.description && (
                <>
                  <span>: </span>
                  <span className="filter-desc">{option.description}</span>
                </>
              )}
            </li>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(MultiSearch);
