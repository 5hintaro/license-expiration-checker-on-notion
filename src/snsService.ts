import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({
  region: process.env.AWS_REGION,
});

export async function sendNotification(
  topicArn: string | undefined,
  message: string,
) {
  const params = {
    Message: message,
    TopicArn: topicArn,
  };
  try {
    const data = await snsClient.send(new PublishCommand(params));
    console.log("Message sent:", data.MessageId);
  } catch (err) {
    console.error("Error sending message:", err);
  }
}
