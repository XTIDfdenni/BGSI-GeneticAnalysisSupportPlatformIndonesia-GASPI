import os
import json

import boto3

ses_client = boto3.client("ses")
SES_SOURCE_EMAIL = os.environ["SES_SOURCE_EMAIL"]
GASPI_ADMINISTRATOR_EMAIL = os.environ["GASPI_ADMINISTRATOR_EMAIL"]


def lambda_handler(event, _):
    print("Event Received: {}".format(json.dumps(event)))
    if event["detail"]["severity"] == "High":
        subject = "Inspector Alert: High Severity Finding Detected"
        body_html = f"""
        <html>
          <head>
            <style>
              body {{
                font-family: Arial, sans-serif;
                color: #333;
              }}
              .container {{
                max-width: 600px;
                margin: auto;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 5px;
                background-color: #f9f9f9;
              }}
              h1 {{
                color: #33548e;
              }}
              p {{
                line-height: 1.6;
              }}
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Inspector Alert</h1>
              <p>A high severity finding has been detected in your environment.</p>
              <p>Severity: High</p>
              <p>Details: {event["detail"]["description"]}</p>
              <p>Thank you,<br>Inspector</p>
            </div>
          </body>
        </html>
        """
        response = ses_client.send_email(
            Source=SES_SOURCE_EMAIL,
            Destination={"ToAddresses": [GASPI_ADMINISTRATOR_EMAIL]},
            Message={
                "Subject": {"Data": subject},
                "Body": {"Html": {"Data": body_html}},
            },
        )
        print("Email Sent: {}".format(json.dumps(response)))
