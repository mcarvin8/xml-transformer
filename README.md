# XML Disassembler

[![NPM](https://img.shields.io/npm/v/xml-disassembler.svg?label=xml-disassembler)](https://www.npmjs.com/package/xml-disassembler) [![Downloads/week](https://img.shields.io/npm/dw/xml-disassembler.svg)](https://npmjs.org/package/xml-disassembler)

A JavaScript package to disassemble XML files into smaller, more manageable files and re-assemble them when needed.

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>

- [Background](#background)
- [Trade-offs](#trade-offs)
- [Install](#install)
- [Disassembling Files](#disassembling-files)
- [Reassembling Files](#reassembling-files)
- [Use Case](#use-case)
- [Ignore File](#ignore-file)
- [XML Parser](#xml-parser)
- [Logging](#logging)
- [Extensions](#extensions)
- [Template](#template)
</details>


## Background

Large XML files, especially those generated by external tools, can be challenging to review and manage. These files contains thousands of lines of elements, making it difficult to track changes during version control and easy to lose changes if these files are automatically generated.
Traditional diff algorithms are not always suitable for these types of files, and manually reviewing changes can be time-consuming and error-prone.

The XML Disassembler package addresses this issue by breaking down large XML files into smaller, more digestible chunks. This makes it easier to review changes, identify additions and deletions, and collaborate on version control repositories in GitHub, GitLab, etc. that store XML files.

## Trade-offs

Using a custom XML diff algorithm can be beneficial in some cases. However, these algorithms are often complex and require significant expertise to implement correctly. Additionally, they may not be compatible with all types of XML files or your version control instance and could introduce errors during the diffing process.

The XML Disassembler package offers a simpler alternative by breaking down XML files into smaller parts. This approach is more straightforward and easier to understand, making it suitable for a wider range of users. It also allows for more granular control over the review process, as each individual file can be reviewed separately.

While there are trade-offs between using a custom diff algorithm and the XML Disassembler package, the latter provides a practical and accessible solution for managing large XML files.

## Install

Install the package using NPM:

```
npm install xml-disassembler
```

## Disassembling Files

Disassemble 1 XML file or multiple XML files in the immediate directory, without recursion. Each XML file will be disassembled into their own sub-directories using their base name (everything before the first `.` in the file-name). The paths you provide must be **relative** paths.

Example:

An XML file (`HR_Admin.permissionset-meta.xml`) with the following nested and leaf elements

```xml
<?xml version="1.0" encoding="UTF-8"?>
<PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata">
    <applicationVisibilities>
        <application>JobApps__Recruiting</application>
        <visible>true</visible>
    </applicationVisibilities>
    <classAccesses>
        <apexClass>Send_Email_Confirmation</apexClass>
        <enabled>true</enabled>
    </classAccesses>
    <fieldPermissions>
        <editable>true</editable>
        <field>Job_Request__c.Salary__c</field>
        <readable>true</readable>
    </fieldPermissions>
    <description>Grants all rights needed for an HR administrator to manage employees.</description>
    <label>HR Administration</label>
    <userLicense>Salesforce</userLicense>
    <objectPermissions>
        <allowCreate>true</allowCreate>
        <allowDelete>true</allowDelete>
        <allowEdit>true</allowEdit>
        <allowRead>true</allowRead>
        <viewAllRecords>true</viewAllRecords>
        <modifyAllRecords>true</modifyAllRecords>
        <object>Job_Request__c</object>
    </objectPermissions>
    <pageAccesses>
        <apexPage>Job_Request_Web_Form</apexPage>
        <enabled>true</enabled>
    </pageAccesses>
    <recordTypeVisibilities>
        <recordType>Recruiting.DevManager</recordType>
        <visible>true</visible>
    </recordTypeVisibilities>
    <tabSettings>
        <tab>Job_Request__c</tab>
        <visibility>Available</visibility>
    </tabSettings>
    <userPermissions>
        <enabled>true</enabled>
        <name>APIEnabled</name>
    </userPermissions>
</PermissionSet>
```

will be disassembled into a sub-directory named `HR_Admin` as such:

- Each nested element (`<recordTypeVisibilities>`, `<applicationVisibilities>`, `pageAccesses`, etc.) will be disassembled into further sub-directories by the nested element name. If a unique & required ID element (`application` is the unique ID element for `<applicationVisibilities>`) is found, the disassembled file will be named using it. Otherwise, the disassembled files for nested elements will be named using the SHA-256 of the element contents.
- Each leaf element (`<description>`, `<label>`, `<userLicense>`) will be disassembled into the same file in the first sub-directory, which will have the same file-name as the original file.

<img src="https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled.png">

<br>

<img src="https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled-hashes.png">

<br>

Import the `DisassembleXMLFileHandler` class from the package.

```typescript
/* 
FLAGS
- filePath: Relative path to 1 XML file or a directory of XML files to disassemble. If the path provided is a directory, only the files in the immediate directory will be disassembled.
- uniqueIdElements: (Optional) Comma-separated list of unique and required ID elements used to name disassembled files for nested elements. 
                               Defaults to SHA-256 hash if unique ID elements are undefined or not found.
- prePurge:  (Optional) Boolean value. If set to true, purge pre-existing disassembled directories prior to disassembling the file.
                               Defaults to false.
- postPurge: (Optional) Boolean value. If set to true, purge the original XML file after disassembling it.
                               Defaults to false.
- ignorePath: (Optional) Path to an ignore file containing XML files to ignore during disassembly. See "Ignore File" section.
*/
import { DisassembleXMLFileHandler } from "xml-disassembler";

const handler = new DisassembleXMLFileHandler();
await handler.disassemble({
  filePath: "test/baselines/general",
  uniqueIdElements:
    "application,apexClass,name,externalDataSource,flow,object,apexPage,recordType,tab,field",
  prePurge: true,
  postPurge: true,
  ignorePath: ".xmldisassemblerignore",
});
```

## Reassembling Files

Reassemble 1 XML directory (`filePath`) containing disassembled files back into 1 XML file. The paths you provide must be **relative** paths.

**NOTE**: You should be reassembling files created by this package's `DisassembleXMLFileHandler` class for intended results. This class will assume all disassembled files in `filePath` have the same XML Root Element. The reassembled XML file will be created in the parent directory of `filePath` and will overwrite the original file used to create the original disassembled directories, if it still exists and the `fileExtension` flag matches the original file extension.

Import the `ReassembleXMLFileHandler` class from the package.

```typescript
/* 
FLAGS
- filePath: Relative path to the disassembled XML files to reassemble (must be a directory)
- fileExtension: (Optional) Desired file extension for the final XML (default: `.xml`)
- postPurge: (Optional) Boolean value. If set to true, purge the disassembled file directory (filePath) after reassembly.
                               Defaults to false.
*/
import { ReassembleXMLFileHandler } from "xml-disassembler";

const handler = new ReassembleXMLFileHandler();
await handler.reassemble({
  filePath: "test/baselines/general/HR_Admin",
  fileExtension: "permissionset-meta.xml",
  postPurge: true,
});
```

## Use Case

Refer to the Salesforce plugin, [SFDX Decomposer](https://github.com/mcarvin8/sfdx-decomposer-plugin), to see a use case of this package:

- [Disassemble Use Case](https://github.com/mcarvin8/sfdx-decomposer-plugin/blob/main/src/service/decomposeFileHandler.ts)
- [Reassemble Use Case](https://github.com/mcarvin8/sfdx-decomposer-plugin/blob/main/src/service/recomposeFileHandler.ts)

## Ignore File

If you wish, you can create an ignore file to have the disassembler ignore specific XMLs similar to a `.gitignore` file.

The disassembler uses the [node-ignore](https://github.com/kaelzhang/node-ignore) package to parse ignore files that follow [.gitignore spec 2.22.1](https://git-scm.com/docs/gitignore).

By default, the XML disassembler will look for an ignore file named `.xmldisassemblerignore` in the current working directory. Set the `ignorePath` flag to override this ignore path.

## XML Parser

The XML parser, which uses the `fast-xml-parser` package, is configured to retain any Character Data (CDATA) values (`<![CDATA[some stuff]]>`) and comments (`<translation><!-- Four --></translation>`) in the original XML file.

## Logging

By default, the package will not print any debugging statements to the console. Any error or debugging statements will be added to a log file, `disassemble.log`, created in the same directory you are running this package in. This file will be created when running the package in all cases, even if there are no errors.

The logger's default state is to only log errors to `disassemble.log`. Check this file for ERROR statements that will look like:

```
[2024-03-30T14:28:37.950] [ERROR] default - The XML file HR_Admin.no-nested-elements.xml only has leaf elements. This file will not be disassembled.
```

To add additional debugging statements to the log file, import the `setLogLevel` function from the package and run the function with `debug` to print all debugging statements to a log file.

When the log level is set to `debug`, the log file will contain statements like this to indicate which files were processed for disassembly and reassembly:

```
[2024-03-30T14:28:37.926] [DEBUG] default - Parsing directory to reassemble: mock/no-namespace/HR_Admin
[2024-03-30T14:28:37.936] [DEBUG] default - Created reassembled file: mock\no-namespace\HR_Admin.permissionset-meta.xml

[2024-03-30T14:28:37.951] [DEBUG] default - Parsing file to disassemble: mock\no-nested-elements\HR_Admin.permissionset-meta.xml
[2024-03-30T14:28:37.953] [DEBUG] default - Created disassembled file: mock\no-nested-elements\HR_Admin\applicationVisibilities\5593cf61.applicationVisibilities-meta.xml
[2024-03-30T14:28:37.954] [DEBUG] default - Created disassembled file: mock\no-nested-elements\HR_Admin\classAccesses\2e5749c9.classAccesses-meta.xml
[2024-03-30T14:28:37.955] [DEBUG] default - Created disassembled file: mock\no-nested-elements\HR_Admin\fieldPermissions\16129a47.fieldPermissions-meta.xml
[2024-03-30T14:28:37.956] [DEBUG] default - Created disassembled file: mock\no-nested-elements\HR_Admin\objectPermissions\81268af4.objectPermissions-meta.xml
[2024-03-30T14:28:37.956] [DEBUG] default - Created disassembled file: mock\no-nested-elements\HR_Admin\pageAccesses\d6d8105a.pageAccesses-meta.xml
[2024-03-30T14:28:37.957] [DEBUG] default - Created disassembled file: mock\no-nested-elements\HR_Admin\recordTypeVisibilities\077548e3.recordTypeVisibilities-meta.xml
[2024-03-30T14:28:37.957] [DEBUG] default - Created disassembled file: mock\no-nested-elements\HR_Admin\tabSettings\181e6985.tabSettings-meta.xml
[2024-03-30T14:28:37.958] [DEBUG] default - Created disassembled file: mock\no-nested-elements\HR_Admin\userPermissions\0288499e.userPermissions-meta.xml
[2024-03-30T14:28:37.959] [DEBUG] default - Created disassembled file: mock\no-nested-elements\HR_Admin\HR_Admin.permissionset-meta.xml
```

```typescript
import {
  DisassembleXMLFileHandler,
  ReassembleXMLFileHandler,
  setLogLevel,
} from "xml-disassembler";

const debug: boolean = true;

if (debug) {
  setLogLevel("debug");
}

const disassembleHandler = new DisassembleXMLFileHandler();
await disassembleHandler.disassemble({
  filePath: "test/baselines/general",
  uniqueIdElements:
    "application,apexClass,name,externalDataSource,flow,object,apexPage,recordType,tab,field",
  prePurge: true,
  postPurge: true,
});

const reassembleHandler = new ReassembleXMLFileHandler();
await reassembleHandler.reassemble({
  filePath: "test/baselines/general/HR_Admin",
  fileExtension: "permissionset-meta.xml",
});
```

## Extensions

These 2 extension packages depend on XML disassembler:

- [XML2JSON Disassembler](https://github.com/mcarvin8/xml2json-disassembler): Disassemble large XML files into smaller JSON files and reassemble the original XML file when needed
- [XML2YAML Disassembler](https://github.com/mcarvin8/xml2yaml-disassembler): Disassemble large XML files into smaller YAML files and reassemble the original XML file when needed


## Template

This project was created from a template provided by [Allan Oricil](https://github.com/AllanOricil). Thank you Allan!

His original [license](https://github.com/AllanOricil/js-template/blob/main/LICENSE) remains in this project.
