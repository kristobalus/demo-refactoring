/**
 * в этом файле устанавливаются зависимости между компонентами приложения в рамках DI
 */

import { Container } from "typedi";
import { LoggerFactory } from "../components/logger-factory";
import Logger = require("bunyan");

Container.set(LoggerFactory, new LoggerFactory())

const logger = Container.get<LoggerFactory>(LoggerFactory).create("app");
Container.set(Logger, logger)
