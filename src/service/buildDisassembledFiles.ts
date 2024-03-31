"use strict";

import * as fs from "node:fs";
import * as promise from "node:fs/promises";
import * as path from "node:path";
import { logger } from "@src/index";
import { XMLParser } from "fast-xml-parser";

import { XML_HEADER } from "@src/helpers/constants";
import { XmlElement, XML_PARSER_OPTION } from "@src/helpers/types";
import { findUniqueIdElement } from "@src/service/findUniqueIdElement";
import { buildNestedElements } from "@src/service/buildNestedElements";

export function buildDisassembledFiles(
  xmlString: string,
  metadataPath: string,
  uniqueIdElements: string | undefined,
  baseName: string,
  indent: string,
  postPurge: boolean,
  parentPath: string,
): void {
  const xmlParser = new XMLParser(XML_PARSER_OPTION);
  let result: Record<string, XmlElement>;
  try {
    result = xmlParser.parse(xmlString, true) as Record<string, XmlElement>;
  } catch (err) {
    logger.error(
      `${baseName}.xml was unable to be parsed. Confirm formatting and try again.`,
    );
    return;
  }
  const rootElementName = Object.keys(result)[1];

  const rootElement: XmlElement = result[rootElementName];
  let rootElementHeader = `<${rootElementName}`;
  // Add any attributes prefixed with "@"
  for (const [attrKey, attrValue] of Object.entries(rootElement)) {
    if (attrKey.startsWith("@")) {
      logger.debug(attrKey);
      const cleanAttrKey = attrKey.slice(2); // Remove the "@" prefix
      rootElementHeader += ` ${cleanAttrKey}="${String(attrValue)}"`;
    }
  }
  rootElementHeader += ">";
  let leafContent = "";
  let leafCount = 0;
  let hasNestedElements: boolean = false;

  // Iterate through child elements to find the field name for each
  Object.keys(rootElement)
    .filter((key: string) => !key.startsWith("@"))
    .forEach((key: string) => {
      if (Array.isArray(rootElement[key])) {
        // Iterate through the elements of the array
        for (const element of rootElement[key] as XmlElement[]) {
          if (typeof element === "object") {
            buildNestedFile(
              element,
              metadataPath,
              uniqueIdElements,
              rootElementName,
              rootElementHeader,
              key,
              indent,
            );
            hasNestedElements = true;
          } else {
            const fieldValue = element;
            leafContent += `${indent}<${key}>${String(fieldValue)}</${key}>\n`;
            leafCount++;
          }
        }
      } else if (typeof rootElement[key] === "object") {
        buildNestedFile(
          rootElement[key] as XmlElement,
          metadataPath,
          uniqueIdElements,
          rootElementName,
          rootElementHeader,
          key,
          indent,
        );
        hasNestedElements = true;
      } else {
        // Process XML elements that do not have children (e.g., leaf elements)
        const fieldValue = rootElement[key];
        // Append leaf element to the accumulated XML content
        leafContent += `${indent}<${key}>${String(fieldValue)}</${key}>\n`;
        leafCount++;
      }
    });

  if (!hasNestedElements) {
    logger.error(
      `The XML file ${baseName}.xml only has leaf elements. This file will not be disassembled.`,
    );
    return;
  }

  if (leafCount > 0) {
    let leafFile = `${XML_HEADER}\n`;
    leafFile += rootElementHeader;

    const sortedLeafContent = leafContent
      .split("\n") // Split by lines
      .filter((line) => line.trim() !== "") // Remove empty lines
      .sort((a, b) => a.localeCompare(b)) // Sort alphabetically
      .join("\n"); // Join back into a string
    leafFile += sortedLeafContent;
    leafFile += `\n</${rootElementName}>`;
    const leafOutputPath = path.join(metadataPath, `${baseName}.xml`);
    fs.writeFileSync(leafOutputPath, leafFile);

    logger.debug(`Created disassembled file: ${leafOutputPath}`);
  }
  if (postPurge) {
    const originalFilePath = path.resolve(`${parentPath}/${baseName}.xml`);
    promise.unlink(originalFilePath);
  }
}

function buildNestedFile(
  element: XmlElement,
  metadataPath: string,
  uniqueIdElements: string | undefined,
  rootElementName: string,
  rootElementHeader: string,
  parentKey: string,
  indent: string,
): void {
  let elementContent = "";

  const fieldName = findUniqueIdElement(element, uniqueIdElements);

  const outputDirectory = path.join(metadataPath, parentKey);
  const outputFileName: string = `${fieldName}.${parentKey}-meta.xml`;
  const outputPath = path.join(outputDirectory, outputFileName);

  // Create the output directory if it doesn't exist
  fs.mkdirSync(outputDirectory, { recursive: true });

  // Call the buildNestedElements to build the XML content string
  elementContent = buildNestedElements(element);
  let decomposeFileContents = `${XML_HEADER}\n`;
  decomposeFileContents += `${rootElementHeader}\n`;
  decomposeFileContents += `${indent}<${parentKey}>\n`;
  decomposeFileContents += `${elementContent}\n`;
  decomposeFileContents += `${indent}</${parentKey}>\n`;
  decomposeFileContents += `</${rootElementName}>`;

  // Write the XML content to the determined output path
  fs.writeFileSync(outputPath, decomposeFileContents);
  logger.debug(`Created disassembled file: ${outputPath}`);
}
