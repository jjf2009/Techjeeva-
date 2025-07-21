import {useEffect, useState } from "react";
import Papa from "papaparse";
import emailjs from '@emailjs/browser';

// ENV Variables or constants
const EMAILJS_SERVICE_ID = "service_i6ouf4o";
const EMAILJS_TEMPLATE_ID = "template_p3y2rn6";
const EMAILJS_USER_ID = "RQN5ddiHNl8dcaskq";

const notifySheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1kiCFeQNcNGhn3MMlsKdg8EhDi4Qbamuy2NKPentn37a3L85gvJkABfAnlPYi-8IdVuEg7Pbi58-F/pub?gid=508183757&single=true&output=csv";

const schemesSheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1kiCFeQNcNGhn3MMlsKdg8EhDi4Qbamuy2NKPentn37a3L85gvJkABfAnlPYi-8IdVuEg7Pbi58-F/pub?gid=0&single=true&output=csv&gid=508183757";

export default function NotifyChecker() {
  const [status, setStatus] = useState("Idle");

  const fetchCSV = async (url) => {
    const res = await fetch(url);
    const text = await res.text();
    return Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: (h) => h.trim(),
    }).data;
  };

  const formatScheme = (row) => {
    const deadlineDate = row["Deadline"] ? new Date(row["Deadline"]) : null;
    const currentDate = new Date();
    const status = deadlineDate ? (deadlineDate < currentDate ? "Closed" : "Open") : "Unknown";

    return {
      title: row["Program"],
      organization: row["Organization"],
      deadline: row["Deadline"],
      status,
    };
  };

  const sendEmail = (user, program, org) => {
    const params = {
      to_name: user.Name,
      to_email: user.Email,
      program_name: program,
      organization_name: org,
      message: `Hi ${user.Name},\n\nThe program '${program}' by '${org}' is currently open.`,
    };

    emailjs
      .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params, EMAILJS_USER_ID)
      .then((res) => {
        console.log(`✅ Email sent to ${user.Email}`, res.text);
      })
      .catch((err) => {
        console.error(`❌ Email failed to ${user.Email}`, err);
      });
  };

  const checkAndNotify = async () => {
    setStatus("Checking...");
    try {
      const [notifyData, schemesRaw] = await Promise.all([
        fetchCSV(notifySheetURL),
        fetchCSV(schemesSheetURL),
      ]);

      const schemes = schemesRaw.map(formatScheme);
      const currentDate = new Date();

      console.log(schemes);
      console.log(notifyData);

      notifyData.forEach((user) => {
        if (!user.Email) return;

        const match = schemes.find(
          (s) =>
            s.title === user.Program &&
            s.organization === user.Organization &&
            s.status === "Open"
        );

        console.log(match)

        if (match) {
          console.log(`📩 Match for ${user.Name} → ${user.Program}`);
          sendEmail(user, user.Program, user.Organization);
        }
      });

      setStatus("Emails processed.");
    } catch (err) {
      console.error("Error:", err);
      setStatus("Error occurred.");
    }
  };

    useEffect(() => {
    checkAndNotify();
  }, []); 
}
