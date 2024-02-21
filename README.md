# XML Disassembler

[![NPM](https://img.shields.io/npm/v/xml-disassembler.svg?label=xml-disassembler)](https://www.npmjs.com/package/xml-disassembler) [![Downloads/week](https://img.shields.io/npm/dw/xml-disassembler.svg)](https://npmjs.org/package/xml-disassembler)

A JS package to disassemble XML files into smaller, more manageable files and re-assemble them when needed.

This package is in active development and may have bugs. Once this is deemed stable, this plugin will be released as v1.0.0.

## Background

Large XML files, especially those generated by external tools, can be challenging to review and manage. These files contains thousands of lines of elements, making it difficult to track changes during version control and easy to lose changes if these files are automatically generated.
Traditional diff algorithms are not always suitable for these types of files, and manually reviewing changes can be time-consuming and error-prone.

The XML Disassembler package addresses this issue by breaking down large XML files into smaller, more digestible chunks. This makes it easier to review changes, identify additions and deletions, and collaborate on projects involving XML files.

## Trade-offs

Using a custom XML diff algorithm can be beneficial in some cases. However, these algorithms are often complex and require significant expertise to implement correctly. Additionally, they may not be compatible with all types of XML files or your version control instance and could introduce errors during the diffing process.

The XML Disassembler package offers a simpler alternative by breaking down XML files into smaller parts. This approach is more straightforward and easier to understand, making it suitable for a wider range of users. It also allows for more granular control over the review process, as each individual file can be reviewed separately.

While there are trade-offs between using a custom diff algorithm and the XML Disassembler package, the latter provides a practical and accessible solution for managing large XML files.

## Install

Install the package using NPM:

```
npm install xml-disassembler
```

## Diassembling Files

Import the `DisassembleXMLFileHandler` class from the package.

```typescript
/* 
FLAGS
- xmlElement: XML Root Element used for disassembled leaf file
- xmlPath: Directory containing the XML files to disassemble (must be directory). This will only disassemble files in the immediate directory.
- uniqueIdElements: (Optional) Comma-separated list of unique and required ID elements used to name disassembled files for nested elements. Defaults to SHA-256 hash if unique ID elements are undefined or not found.
*/
const handler = new DisassembleXMLFileHandler();
await handler.disassemble({
  xmlPath: "test/baselines/general",
  uniqueIdElements:
    "application,apexClass,name,externalDataSource,flow,object,apexPage,recordType,tab,field",
  xmlElement: "PermissionSet",
});
```

Example:

An XML with the following nested and leaf elements

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

will be diassembled as such:

- Each nested element (`<recordTypeVisibilities>`, `<applicationVisibilities>`, `pageAccesses`, etc.) will be disassembled into sub-directories by the nested element name. If a unique & required ID element (`application` is the unique ID element for `<applicationVisibilities>`) is found, the disassembled file will be named using it.
- Each leaf element (`<description>`, `<label>`, `<userLicense>`) will be disassembled into the same file.

<img src="https://raw.githubusercontent.com/mcarvin8/xml-disassembler/main/.github/images/disassembled.png">

<br>

### File Handlers

It is up to the user to add additional file handlers before they run the `DisassembleXMLFileHandler` class.

## Reassembling Files

Import the `ReassembleXMLFileHandler` class from the package.

```typescript
/* 
FLAGS
- xmlElement: XML Root Element for the final reassembled file
- xmlPath: Path to the disassembled XML files to reassemble (must be a directory)
- xmlNamespace: (Optional) Namespace for the final XML (default: None)
- fileExtension: (Optional) Desired file extension for the final XML (default: `.xml`)
*/
const handler = new ReassembleXMLFileHandler();
await handler.reassemble({
  xmlPath: "test/baselines/general/HR_Admin",
  xmlElement: "PermissionSet",
  xmlNamespace: "http://soap.sforce.com/2006/04/metadata",
  fileExtension: "permissionset-meta.xml",
});
```

The reassembled XML file will be created in the parent directory of `xmlPath` and will overwrite the original file used to create the original disassembled directories, if it still exists and the `fileExtension` flag matches the original file extension.

## Template

This project was created from a template provided by [Allan Oricil](https://github.com/AllanOricil). Thank you Allan!

His original [license](https://github.com/AllanOricil/js-template/blob/main/LICENSE) remains in this project.
