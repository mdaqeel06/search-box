import { useState } from "react";
import MultiSearch from "./MultiSearch";

function App() {
  const [data] = useState([
    {
      type: "text",
      label: "Name",
      description:
        "Filter by entering a specific name (e.g., first or last name).",
      key: "name",
    },
    {
      type: "dropdown",
      label: "Gender",
      description:
        "Filter by selecting a gender from predefined options (e.g., Male, Female).",
      key: "gender",
      options: ["Male", "Female"],
    },
    {
      type: "boolean",
      label: "Is Eligible",
      description: "Filter by eligibility status (e.g., Yes or No).",
      key: "is_eligible",
    },
    {
      type: "text",
      label: "Email ID",
      description: "ilter by entering a specific email address.",
      key: "email_id",
    },
    {
      type: "dropdown",
      label: "Education",
      description:
        "Filter by selecting an education level (e.g., High School, Bachelor's, Master's).",
      key: "education",
      options: ["High School", "Bachelor's", "Master's"],
    },
  ]);
  return (
    <MultiSearch
      data={data}
      width={700}
      onFilter={(filters) => console.info(filters)}
    />
  );
}

export default App;
