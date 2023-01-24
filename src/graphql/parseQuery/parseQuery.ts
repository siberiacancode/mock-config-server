import type { DocumentNode, OperationDefinitionNode, OperationTypeNode } from 'graphql';
import { parse } from 'graphql';

export interface ParseDocumentNodeResult {
  operationType: OperationTypeNode;
  operationName: string;
}

export const parseDocumentNode = (node: DocumentNode): ParseDocumentNodeResult => {
  const operationDef = node.definitions.find(
    (def) => def.kind === 'OperationDefinition'
  ) as OperationDefinitionNode;

  return {
    operationType: operationDef?.operation,
    operationName: operationDef?.name?.value ?? ''
  };
};

export const parseQuery = (query: string) => {
  const ast = parse(query);
  return parseDocumentNode(ast);
};
