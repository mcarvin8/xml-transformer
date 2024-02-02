"use strict";

import * as fs from "node:fs";
import * as path from "node:path";
import { XMLParser } from "fast-xml-parser";

import { XML_HEADER } from "@src/helpers/constants";
import { XmlElement, XML_PARSER_OPTION } from "@src/helpers/types";
import { findUniqueIdElement } from "@src/service/findUniqueIdElement";
import { buildNestedElements } from "@src/service/buildNestedElements";

export function buildDisassembledFiles(
  xmlString: string,
  metadataPath: string,
  uniqueIdElements: string | undefined,
  xmlElement: string,
  baseName: string,
  indent: string,
): void {
  const xmlParser = new XMLParser(XML_PARSER_OPTION);
  const result = xmlParser.parse(xmlString) as Record<string, XmlElement>;

  const rootElementName = Object.keys(result)[1];
  const rootElement: XmlElement = result[rootElementName];
  let leafContent = "";
  let leafCount = 0;

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
              key,
              indent,
            );
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
          key,
          indent,
        );
      } else {
        // Process XML elements that do not have children (e.g., leaf elements)
        const fieldValue = rootElement[key];
        // Append leaf element to the accumulated XML content
        leafContent += `${indent}<${key}>${String(fieldValue)}</${key}>\n`;
        leafCount++;
      }
    });

  if (leafCount > 0) {
    let leafFile = `${XML_HEADER}\n`;
    leafFile += `<${xmlElement}>\n`;

    const sortedLeafContent = leafContent
      .split("\n") // Split by lines
      .filter((line) => line.trim() !== "") // Remove empty lines
      .sort() // Sort alphabetically
      .join("\n"); // Join back into a string
    leafFile += sortedLeafContent;
    leafFile += `\n</${xmlElement}>`;
    const leafOutputPath = path.join(metadataPath, `${baseName}.xml`);
    fs.writeFileSync(leafOutputPath, leafFile);

    console.log(`All leaf elements saved to: ${leafOutputPath}`);
  }
}

function buildNestedFile(
  element: XmlElement,
  metadataPath: string,
  uniqueIdElements: string | undefined,
  parentKey: string,
  indent: string,
): void {
  let elementContent = "";
  elementContent += `${XML_HEADER}\n`;

  const fieldName = findUniqueIdElement(element, uniqueIdElements);

  const outputDirectory = path.join(metadataPath, parentKey);
  const outputFileName: string = `${fieldName}.${parentKey}-meta.xml`;
  const outputPath = path.join(outputDirectory, outputFileName);

  // Create the output directory if it doesn't exist
  fs.mkdirSync(outputDirectory, { recursive: true });

  // Call the buildNestedElements to build the XML content string
  elementContent = buildNestedElements(element);
  let decomposeFileContents = `${XML_HEADER}\n`;
  decomposeFileContents += `${indent}<${parentKey}>\n`;
  decomposeFileContents += `${elementContent}\n`;
  decomposeFileContents += `${indent}</${parentKey}>\n`;

  // Write the XML content to the determined output path
  fs.writeFileSync(outputPath, decomposeFileContents);
  console.log(`XML content saved to: ${outputPath}`);
}
