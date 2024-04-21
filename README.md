# license-expiration-checker-on-notion

This simplifies the management of certificates and licences. Alerts are sent out when a set number of days before the date is reached. The alerts use AWS SNS, so notifications can be sent to email or Slack (which requires the use of AWS Chatbot).

## Setup

### 1. Set environment variables for serverless framework

```sh
# install
bun i

# create env file
bun env
```

.env file is created, update values

### 2. Deploy to AWS

To specify a profile, use `--aws-profile your_aws_profile_name`.

Also, users created with `aws configure sso` cannot be used, so take action such as setting an environment variable.

```sh
# deploy to aws
bun slsdeploy

# deploy to aws: specify a profile
bun slsdeploy --aws-profile foobar
```

✅ Note the ARN of the SNS topic in the CloudFormation Outputs.

### 3. Set Notion

1. Start by copying [the template](https://cotton-egret-e92.notion.site/464e2c9566af4a8d98c7bdfe6714a582?v=e753707793a14c6f8807da13a0c6c95c&pvs=4) directly into your Notion workspace.
2. After the template has been successfully copied (database), feel free to personalize it by altering its icon, title, and description to better fit your needs.
3. For future use, determine the `DATABASE_ID` by locating the specific part of the URL of the copied page (database) that appears like this: https://notion.so/your-account/?v=xxxx.
4. [Establish a Notion integration](https://developers.notion.com/docs/create-a-notion-integration#step-1-create-an-integration) and make sure to record the "Internal Integration Token" as NOTION_API_SECRET.
5. To connect your application with Notion, [link your database with the integration you created](https://developers.notion.com/docs/create-a-notion-integration#step-2-share-a-database-with-your-integration).
6. If you wish to have this repository in your own account, simply fork it by clicking on the 'Fork' button located at the upper-right corner of the repository page.

### 3. Set environment variables on Github repository

Set the following environment variables in the Github repository secret

- `AWS_REGION` : your region (e.g. `ap-northeast-1`)
- `AWS_SNS_TOPIC_ARN` : your AWS SNS Topic ARN
- `NOTION_TOKEN` : your Notion token
- `DATABASE_ID` : your Notion database ID
- `DAYS_BEFORE_ALERT` : Set how many days in advance to notify, use a comma as separator. (e.g. `10,30`)

If you want to test locally, run the following command.

```sh
# env
export AWS_REGION="your_region"
export AWS_SNS_TOPIC_ARN="your_aws_sns_topic_arn"
export NOTION_TOKEN="your_notion_api_token"
export DATABASE_ID="your_database_id"
export DAYS_BEFORE_ALERT="10,30"

# run
bun deploy
```
