import emailjs from '@emailjs/browser';
import Papa from 'papaparse';

const Schemes_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1kiCFeQNcNGhn3MMlsKdg8EhDi4Qbamuy2NKPentn37a3L85gvJkABfAnlPYi-8IdVuEg7Pbi58-F/pub?gid=0&single=true&output=csv";
const notify_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1kiCFeQNcNGhn3MMlsKdg8EhDi4Qbamuy2NKPentn37a3L85gvJkABfAnlPYi-8IdVuEg7Pbi58-F/pub?gid=508183757&single=true&output=csv";

const EMAILJS_SERVICE_ID = 'your_service_id';
const EMAILJS_TEMPLATE_ID = 'your_template_id';
const EMAILJS_USER_ID = 'your_public_key';

function formatFundingData(data) {
  const deadlineDate = data["Deadline"] ? new Date(data["Deadline"]) : null;
  const currentDate = new Date();

  let status = "Unknown";
  if (deadlineDate) {
    status = deadlineDate < currentDate ? "Closed" : "Open";
  }

  return {
    title: data["Program"] || "Untitled Program",
    organization: data["Organization"] || "Unknown Organization",
    focusAreas: data["Focus_Area"]
      ? data["Focus_Area"]
          .replace(/^[\s"']*(.*?)[\s"']*$/, "$1")
          .split(",")
          .map((f) => f.trim())
      : [],
    support: data["Grant/Support"] || "Not specified",
    deadline: data["Deadline"] || null,
    applyLink: data["Link"] || "#",
    fundingType: data["Funding Type"] || "Not specified",
    status,
  };
}

async function getSchemeData() {
  try {
    const res = await fetch(Schemes_URL);
    const text = await res.text();
    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: (h) => h.trim(),
    });

    console.log("Raw scheme data:", parsed.data);
    const formatted = parsed.data.map(formatFundingData);
    console.log("Formatted scheme data:", formatted);
    return formatted;
  } catch (error) {
    console.error("Error fetching scheme data:", error);
    return [];
  }
}

async function getNotifyData() {
  try {
    const res = await fetch(notify_URL);
    const text = await res.text();
    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: (h) => h.trim(),
    });

    console.log("Notify data:", parsed.data);
    return parsed.data;
  } catch (error) {
    console.error("Error fetching notify data:", error);
    return [];
  }
}

function sendEmail(name, email, program, org) {
  const templateParams = {
    to_name: name,
    to_email: email,
    program_name: program,
    organization_name: org,
    message: `Hi ${name},\n\nThe program '${program}' by '${org}' is currently open. Don’t miss out!`,
  };

  emailjs
    .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_USER_ID)
    .then((response) => {
      console.log(`Email sent to ${name} at ${email}`, response.status, response.text);
    })
    .catch((error) => {
      console.error(`Error sending email to ${name}:`, error);
    });
}

async function checkAndNotify() {
  const currentDate = new Date();

  const schemesData = await getSchemeData(); // await fixed
  const notifyData = await getNotifyData(); // await fixed

  for (let i = 0; i < notifyData.length; i++) {
    const { Name: userName, Email: userEmail, Organization, Program } = notifyData[i];

    if (!userEmail) {
      console.log(`Skipping ${userName} due to missing email.`);
      continue;
    }

    for (let j = 0; j < schemesData.length; j++) {
      const scheme = schemesData[j];

      const deadlineDate = scheme.deadline ? new Date(scheme.deadline) : null;
      const status = deadlineDate && deadlineDate >= currentDate ? "Open" : "Closed";

      if (
        scheme.title === Program &&
        scheme.organization === Organization &&
        status === "Open"
      ) {
        console.log(`✅ Match found: ${userName} -> ${Program} at ${Organization}`);
        sendEmail(userName, userEmail, Program, Organization);
      }
    }
  }
}

// Run check
checkAndNotify();
