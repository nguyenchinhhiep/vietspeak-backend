const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const configs = process.env;

const sendEmail = async (email, subject, payload, template) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: configs.EMAIL_USERNAME,
        pass: configs.EMAIL_PASSWORD,
      },
    });

    const source = fs.readFileSync(path.join(__dirname, template), "utf8");
    const compiledTemplate = handlebars.compile(source);

    const options = () => {
      return {
        from: configs.FROM_EMAIL,
        to: email,
        subject: subject,
        html: compiledTemplate(payload),
      };
    };

    // Send email
    transporter.sendMail(options(), (err, info) => {
      if (err) {
        return err;
      }
      return info;
    });
  } catch (err) {
    console.log(err);
    return err;
  }
};

module.exports = sendEmail;
