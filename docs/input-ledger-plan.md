# Input/material suppliers and recipes, next tranche

Latest user clarification: a cappuccino is coffee and milk, so supplier contracts must belong to ingredients/inputs, not to the finished drink. Apply across sectors. This is not in catalog/staffing fb1d9e7.

## Required ledger boundary

Food/manufacturing/farming/construction need material quantities and stock. Retail/pharmacy resell finished merchandise, so SKU purchasing is already a real input: map item SKUs to distributors, do not falsely break a sealed thermometer into components. Service businesses need consumables plus time/workload; software needs compute/storage/API/support resources, not cartons or expiring beans. Supplier record per input includes quoted unit cost, reliability and lead time. Fictional names and country/era game quotes stay labelled.

Each recipe records input IDs and quantities per sold/produced unit. Item sale quote is independent. Preview direct input cost from that recipe, not the previous generic fraction. Track quantities and average-cost inventory per input; saved purchase orders preserve quoted unit price and supplier reliability. Delivery charges exactly one invoice, at receipt. Consumption charges no extra cash if the material invoice already did. Contribution uses actual consumed input value. Expiry reduces input stock/value, not nonexistent item stock. Missing inputs cap output per recipe, preserving other items. Milk shortage stops milk drinks but not americano; bean shortage stops coffee but not tea. Cups shared across drinks compete for stock. No duplicate use or negative balances.

Migration must not create free ingredients or wipe paid product stock. Explicit transition after item stock/pending/WIP clear, or a separately valued legacy lot with honest disposition. Existing catalog remains usable while old stock clears. Service recurring allowances require careful separation from existing fixed costs/cloud to avoid double charge. Construction/crop WIP must reserve or consume inputs at a defined stage, never reprice existing work.

## Coverage

Food: coffee beans, milk, chocolate, tea, pastry supply, cups; lunch/catering use grains/bread/protein/vegetables/packaging rather than coffee recipes. Retail and pharmacy: distributor per item/SKU family with exact receipts. Construction: paint/plaster/timber/fixtures/material lots plus subcontract time where used. Manufacturing: timber/fabric/polymer/fasteners/finish tied to niche. Farming: seed/planting stock, fertiliser, irrigation water, packing crates tied to crop. Logistics: fuel, packaging, refrigeration/vehicle service resource per delivery workload. Clinic: sealed consumables, test consumables, sterilisation resource; staffing remains separate, no medical advice. Education: workbooks, printing, assessment licences and teaching time separately. Software: compute units, storage, paid API calls and support workload, avoiding existing all-user hosting duplication.

## Validation

Resource conservation, shared-stock competition, selective shortage effects, item contribution, receipt cash, pending quote preservation, delivery delay, expiry, WIP material timing, pause/resume, migration/currency/reload, all-sector application, actual household reserve coverage and no duplicated costs. Phone screenshot should show bean/milk suppliers and selective latte versus americano availability, plus a non-food example. Full regression before publish. No finished-product supplier label for cafe drinks.
