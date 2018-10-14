# Serverless Slack Standup

The Serverless Slack Standup bot enables your team's async standup. As it is completely serverless, you can easily host it on the AWS free tier.

## Async standup?

Tradionally, a standup happens in sync: everybody gathers around and briefly answers their standup questions. However, when you have a remote team over multiple time zones, or have your team is just often travelling, an async standup could make more sense.

In the async standup, you answer your standup questions whenever it fits you. One option is to throw your answers in the slack channel. An alternative, is to use an async bot. The bot asks you your questions, and afterwards consolidates all answers in an overview.

## Installation

The only prerequisite is an AWS account: you can register for the free tier here: https://aws.amazon.com/free/. [Here](https://serverless.com/framework/docs/providers/aws/guide/credentials/) is a full tutorial on how to link your AWS account to your serverless setup.

### Create the Slack App

1. Create a new Slack App: https://api.slack.com/apps. Feel free to give your app a fancy name
1. Create a new Bot. We will come back later to activate Interactive Components and Event Subscriptions.
1. Install the application in your workspace.

### Install and deploy the code

1. Clone this github repository locally and install the dependencies:

```bash
git clone https://github.com/pellejacobs/slack-standup-serverless
cd slack-standup-serverless
yarn or npm install # depending on your preferred dependency manager
```

2. Create an copy .env.sample.yml to .env.yml, and replace the dummy values with the proper values. You can find the `SLACK_BOT_TOKEN` on the Slack App interface under 'OAuth & Permissions' as 'Bot User OAuth Access Token' and the `SLACK_SIGNING_SECRET` on the 'Basic Information' view, under 'App Credentials', as 'Signing Secret'.
   Note: currently only private channels are supported. If necessary, this is easily changed by changing `groups.list()` to `channels.list()` in the code.

3. Adjust the cron schedule of your standup in `serverless.yml`. Adjust the cron for `start` to when you want to start your standup. It is by default set to `cron(0 6 ? * MON-FRI *)`, which means every weekday at 6AM UTC. Adjust the cron for `overview` to when you want to have the overview, at the latest. By default, it is set to `cron(0 8 ? * MON-FRI *)`.

4. Deploy the bot to your AWS account with `serverless deploy`

### Finalize the installation

Go back to the Slack App Interface, and add the following functionalities:

- Interactive Components: enable interactive components. When deploying, you should have received the two urls of the new routes you created. Paste here the `/interactive` route.
- Event Subscriptions: enable events. Paste here the `/events` url and make sure it verifies. Scroll down to add a Bot User Event: `message.im`.

You should now have finished the entire setup. You can test your setup by initiating the `start` function manually with `serverless invoke --function start`.

### Optional: Configuration

You can optionally configure the questions and answers of the bot. You will find the configuration file in `src/config.js`. Feel free to add or remove questions, or to change the wording.

Are you having any issues? Do you have any suggestions or remarks? Or do you just want to share your experience? Feel free to open an issue or pull request, we would love to hear from you.

## Contribution

To run the code locally:

```bash
git clone https://github.com/pellejacobs/slack-standup-serverless
cd slack-standup-serverless
yarn or npm install # depending on your preferred dependency manager

serverless dynamodb install
serverless offline start # to start dynamodb and the start listening on the http endpoints
serverlss invoke local --function start # to run one of the cron functions
```

You can use [ngrok](https://ngrok.com/) to easily test the connections with Slack.
