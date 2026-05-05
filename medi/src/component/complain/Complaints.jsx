import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

function Complain() {
  const form = useRef(null);
  const { user } = useAuth();

  const [complaint, setComplaint] = useState({
    name: user ? (user.first_name ?? "") : "",
    email: user ? (user.email ?? "") : "",
    message: "",
  });

  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setComplaint((current) => {
      return {
        ...current,
        [name]: value,
      };
    });
  };

  const sendEmail = (e) => {
    e.preventDefault();
    if (!user) {
      if (
        complaint.message.trim() === "" ||
        complaint.name.trim() === "" ||
        complaint.email.trim() === ""
      ) {
        toast.error("Please fill in all fields before submitting.");
        return;
      }
    }
    if (!complaint.message || complaint.message.trim() === "") {
      toast.error(
        "Please enter your complaint or suggestion before submitting.",
      );
      return;
    }

    emailjs
      .sendForm(serviceId, templateId, form.current, {
        publicKey: publicKey,
      })
      .then(
        () => {
          console.log("SUCCESS!");
          setComplaint({
            name: "",
            email: "",
            message: "",
          });
          toast.success("Complaint submitted successfully!");
        },
        (error) => {
          console.log("FAILED...", error.text);
          toast.error("Failed to submit complaint.");
        },
      );
  };

  return (
    <div className="section-center ">
      <form ref={form} onSubmit={sendEmail} className="form">
        <input
          type={"hidden"}
          name="title"
          value="Complaint or Suggestion"
          placeholder="enter your name"
        />

        <input
          id="name"
          className="form-input"
          type={user ? "hidden" : "text"}
          name="name"
          value={complaint.name}
          onChange={handleChange}
          placeholder="enter your name"
          style={{ marginBottom: "1.75rem" }}
        />

        <input
          id="email"
          className="form-input"
          type={user ? "hidden" : "text"}
          name="email"
          value={complaint.email}
          placeholder="enter your email"
          onChange={handleChange}
          style={{ marginBottom: "1.75rem" }}
        />
        <input type="hidden" name="time" value={new Date().toLocaleString()} />
        <label htmlFor="complaint" className="form-label">
          Your Complaint or Suggestion:
        </label>

        <textarea
          className="form-textarea"
          id="complaint"
          name="message"
          value={complaint.message}
          onChange={handleChange}
          style={{ marginBottom: "3rem" }}
        />
        <button type="submit" className="btn btn-block">
          Submit
        </button>
      </form>
    </div>
  );
}

export default Complain;
