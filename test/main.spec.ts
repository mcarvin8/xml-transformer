import {
  DisassembleXMLFileHandler,
  ReassembleXMLFileHandler,
  setLogLevel,
  logger,
} from "../src/index";

setLogLevel("debug");

describe("main function", () => {
  beforeEach(() => {
    jest.spyOn(console, "log");
    jest.spyOn(logger, "debug");
    jest.spyOn(logger, "error");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should disassemble a general XML file (nested and leaf elements) with unique ID elements."', async () => {
    const handler = new DisassembleXMLFileHandler();
    await handler.disassemble({
      xmlPath: "test/baselines/general",
      uniqueIdElements:
        "application,apexClass,name,externalDataSource,flow,object,apexPage,recordType,tab,field",
    });

    // Ensure that the logger.debug spy was called with the correct message
    expect(logger.error).not.toHaveBeenCalled();
  });
  it('should reassemble a general XML file (nested and leaf elements) with a namespace and file extension."', async () => {
    const handler = new ReassembleXMLFileHandler();
    await handler.reassemble({
      xmlPath: "test/baselines/general/HR_Admin",
      fileExtension: "permissionset-meta.xml",
    });

    // Ensure that the logger.debug spy was called with the correct message
    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should disassemble a XML file with CDATA.", async () => {
    const handler = new DisassembleXMLFileHandler();
    await handler.disassemble({
      xmlPath: "test/baselines/cdata",
      uniqueIdElements: "apiName",
    });

    // Ensure that the logger.debug spy was called with the correct message
    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble a XML file with CDATA.", async () => {
    const handler = new ReassembleXMLFileHandler();
    await handler.reassemble({
      xmlPath: "test/baselines/cdata/VidLand_US",
    });

    // Ensure that the logger.debug spy was called with the correct message
    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should disassemble a XML file with comments and an invalid unique ID element.", async () => {
    const handler = new DisassembleXMLFileHandler();
    await handler.disassemble({
      xmlPath: "test/baselines/comments",
      uniqueIdElements: "invalid",
    });

    // Ensure that the logger.debug spy was called with the correct message
    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble a XML file with comments.", async () => {
    const handler = new ReassembleXMLFileHandler();
    await handler.reassemble({
      xmlPath: "test/baselines/comments/Numbers-fr",
    });

    // Ensure that the logger.debug spy was called with the correct message
    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should disassemble a XML file with a deeply nested unique ID element.", async () => {
    const handler = new DisassembleXMLFileHandler();
    await handler.disassemble({
      xmlPath: "test/baselines/child-unique-id-element",
      uniqueIdElements:
        "apexClass,name,object,field,layout,actionName,targetReference,assignToReference,choiceText,promptText",
    });

    // Ensure that the logger.debug spy was called with the correct message
    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should disassemble a XML file with an array of leaf elements and no defined unique ID element.", async () => {
    const handler = new DisassembleXMLFileHandler();
    await handler.disassemble({
      xmlPath: "test/baselines/array-of-leafs",
    });

    // Ensure that the logger.debug spy was called with the correct message
    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should disassemble a XML file with an array of leaf elements and no defined unique ID element.", async () => {
    const handler = new ReassembleXMLFileHandler();
    await handler.reassemble({
      xmlPath: "test/baselines/array-of-leafs/Dreamhouse",
      fileExtension: "app-meta.xml",
    });

    // Ensure that the logger.debug spy was called with the correct message
    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should purge the existing disassembled directory before disassembling the file.", async () => {
    const handler = new DisassembleXMLFileHandler();
    await handler.disassemble({
      xmlPath: "test/baselines/array-of-leafs",
      purge: true,
    });

    // Ensure that the logger.debug spy was called with the correct message
    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should disassemble a XML file with no namespace.", async () => {
    const handler = new DisassembleXMLFileHandler();
    await handler.disassemble({
      xmlPath: "test/baselines/no-namespace",
      uniqueIdElements:
        "application,apexClass,name,externalDataSource,flow,object,apexPage,recordType,tab,field",
    });

    // Ensure that the logger.debug spy was called with the correct message
    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble a XML file with no namespace.", async () => {
    const handler = new ReassembleXMLFileHandler();
    await handler.reassemble({
      xmlPath: "test/baselines/no-namespace/HR_Admin",
      fileExtension: "permissionset-meta.xml",
    });

    // Ensure that the logger.debug spy was called with the correct message
    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should test disassemble error condition (file path provided).", async () => {
    const handler = new DisassembleXMLFileHandler();
    await handler.disassemble({
      xmlPath: "test/baselines/no-namespace/HR_Admin.permissionset-meta.xml",
    });

    expect(logger.error).toHaveBeenCalled();
  });
  it("should test reassemble error condition (file path provided).", async () => {
    const handler = new ReassembleXMLFileHandler();
    await handler.reassemble({
      xmlPath:
        "test/baselines/no-namespace/HR_Admin/HR_Admin.permissionset-meta.xml",
    });

    expect(logger.error).toHaveBeenCalled();
  });
  it("should test disassemble error condition (no root element in XML).", async () => {
    const handler = new DisassembleXMLFileHandler();
    await handler.disassemble({
      xmlPath: "test/baselines/no-root-element",
    });

    expect(logger.error).toHaveBeenCalled();
  });
  it("should test reassemble error condition (no root element in XML).", async () => {
    const handler = new ReassembleXMLFileHandler();
    await handler.reassemble({
      xmlPath: "test/baselines/no-root-element/Assessment_Bot",
    });

    expect(logger.error).toHaveBeenCalled();
  });
  it("should test disassemble error condition (XML file only has leaf elements).", async () => {
    const handler = new DisassembleXMLFileHandler();
    await handler.disassemble({
      xmlPath: "test/baselines/no-nested-elements",
    });

    expect(logger.error).toHaveBeenCalled();
  });
});