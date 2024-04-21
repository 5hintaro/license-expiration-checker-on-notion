import { Client as NotionClient } from "@notionhq/client";
import * as dotenv from "dotenv";
import { startOfDay, parseISO, differenceInCalendarDays } from "date-fns";
import logger from "./logger";
import { sendNotification } from "./snsService";

dotenv.config();

const getClient = (): NotionClient => {
  const notionToken = process.env.NOTION_TOKEN;
  if (!notionToken) throw new Error("NOTION_TOKEN is not set");
  return new NotionClient({ auth: notionToken });
};

const getDatabaseItems = async (client: NotionClient, databaseId: string) => {
  try {
    const response = await client.databases.query({
      database_id: databaseId,
    });
    return response.results;
  } catch (error) {
    throw new Error(`Error fetching database items: ${error}`);
  }
};

const getDaysBeforeAlert = (): number[] => {
  const daysBeforeStr = process.env.DAYS_BEFORE_ALERT;
  if (!daysBeforeStr) throw new Error("DAYS_BEFORE_ALERT is not set");

  return daysBeforeStr.split(",").map((dayStr) => {
    const day = parseInt(dayStr.trim(), 10);
    if (isNaN(day)) throw new Error(`Invalid day: ${dayStr}`);
    return day;
  });
};

const checkExpiry = (pages: any[], daysBefore: number) => {
  const currentDate = startOfDay(new Date());
  pages.forEach(async (page) => {
    const endDateStr = page.properties.End?.date?.start;
    if (endDateStr) {
      const endDate = startOfDay(parseISO(endDateStr));
      const diffDays = differenceInCalendarDays(endDate, currentDate);
      const name = page.properties.Name?.title?.[0]?.plain_text;
      if (diffDays == daysBefore) {
        const alertMessage = `Alert: ${name} will expire in ${daysBefore} days.`;
        logger.info(alertMessage);
        const topicArn = process.env.AWS_SNS_TOPIC_ARN;
        await sendNotification(topicArn, alertMessage);
      } else {
        logger.info(`${name} has ${diffDays} days remaining`)
      }
    } else {
      logger.error(
        `No end date set for ${page.properties.Name?.title?.[0]?.plain_text}`,
      );
    }
  });
};

const main = async () => {
  try {
    const client = getClient();
    const databaseId = process.env.DATABASE_ID;
    if (!databaseId) throw new Error("DATABASE_ID is not set");

    const pages = await getDatabaseItems(client, databaseId);
    const daysBefore = getDaysBeforeAlert();

    daysBefore.forEach((days) => checkExpiry(pages, days));
  } catch (error) {
    throw new Error(`Application error: ${error}`);
  }
};

main();
