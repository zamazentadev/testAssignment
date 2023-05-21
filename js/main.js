const API_TOKEN = "5986249df8b771a15775399f4bdf3ab19fe12b93";
const API_BASE_URL = "https://fafandra.pipedrive.com/api/v1";
let pipelines,
  persons,
  dealFields = {},
  personId,
  formEntries = {};

// get pipe lines for job sources and set option for it
const getPipelines = () => {
  fetch(`${API_BASE_URL}/pipelines?api_token=${API_TOKEN}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      pipelines = data.data;
      let select = document.getElementById("select");

      pipelines.map((el) => {
        select.innerHTML += `<option value="${el.name}">${el.name}</option>`;
      });
    })
    .catch((er) => {
      console.log("Error fetching pipelines: ", er.message);
    });
};

// get people for person and set option for it
const getPersons = () => {
  fetch(`${API_BASE_URL}/persons?api_token=${API_TOKEN}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      persons = data.data;
      let select = document.getElementById("person");

      persons.map((el) => {
        select.innerHTML += `<option value="${el.name}">${el.name}</option>`;
      });
    })
    .catch((er) => {
      console.log("Error fetching persons: ", er.message);
    });
};

// get deal fields from pipedrive. get field name and field key value to one dealfield object
const getDealFields = () => {
  fetch(`${API_BASE_URL}/dealFields?api_token=${API_TOKEN}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      data.data.map((el) => {
        if (el.id >= 32) {
          dealFields[el.name] = el.key;
        }
      });
    })
    .catch((er) => {
      console.log("Error fetching dealFields: ", er.message);
    });
};

// add person and get person id for creating deal
const addPerson = async (personData) => {
  await fetch(`${API_BASE_URL}/persons?api_token=${API_TOKEN}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(personData),
  })
    .then((response) => response.json())
    .then((data) => {
      personId = data.data.id;
    })
    .catch((er) => {
      console.log("Error adding person: ", er.message);
    });
};

// add deal(job)
const addDeal = async (dealData) => {
  await fetch(`${API_BASE_URL}/deals?api_token=${API_TOKEN}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dealData),
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("form").innerHTML = "";
      document.getElementsByTagName(
        "body"
      )[0].innerHTML = `Job is created successfully. <a href="https://mdrx.pipedrive.com/deal/${data.data.id}"> View deal</a>`;
    })
    .catch((er) => {
      console.log("Error adding deal: ", er.message);
    });
};

getPipelines();
getPersons();
getDealFields();

document.getElementById("form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const btn = document.getElementById("button");
  const formData = new FormData(event.target);
  const person = {
    name: formData.get("firstname"),
    first_name: formData.get("firstname"),
    last_name: formData.get("lastname"),
    phone: formData.get("tel"),
    email: formData.get("email"),
  };

  btn.innerHTML = "Request is sending...";
  btn.style.color = "red";
  btn.disabled = true;

  // get approprate parameters for creating deal from deal fields with form data
  Array.from(formData.entries()).map((el) => {
    if (el[0] === "Technician") {
      el[0] = formData.get("Area") + " Technician";
    }

    if (dealFields[el[0]] !== undefined) {
      formEntries[dealFields[el[0]]] = el[1];
    }
  });

  formEntries["title"] = formData.get("firstname") + " Deal";

  await addPerson(person);

  formEntries["person_id"] = personId;
  btn.innerHTML = "Request is sent...";

  // Clear the form
  event.target.reset();

  await addDeal(formEntries);
});
