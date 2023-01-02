const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const config = process.env;

const sendEmail = (email, subject, payload, template) => {
  return new Promise((resolve, reject) => {
    try {
      // Create transporter Gmail
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: config.EMAIL_USERNAME,
          pass: config.EMAIL_PASSWORD,
        },
      });

      // Read and compile email template
      const source = fs.readFileSync(path.join(__dirname, template), "utf8");
      const compiledTemplate = handlebars.compile(source);

      const options = () => {
        return {
          from: `Vietspeak Support <${config.FROM_EMAIL}>`,
          to: email,
          subject: subject,
          html: compiledTemplate(payload),
        };
      };

      // Send email
      transporter.sendMail(options(), (err, info) => {
        if (err) {
          reject(err);
        }
        resolve(info);
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};

module.exports = sendEmail;
