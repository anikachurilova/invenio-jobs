/*
 * This file is part of Invenio.
 * Copyright (C) 2024 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { BoolFormatter, NotificationContext } from "@js/invenio_administration";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { UserListItemCompact, toRelativeTime } from "react-invenio-forms";
import { withState } from "react-searchkit";
import { Popup, Table, Button } from "semantic-ui-react";
import { Actions } from "@js/invenio_administration";
import { RunButton } from "./RunButton";
import { StatusFormatter } from "./StatusFormatter";
import { AdminUIRoutes } from "@js/invenio_administration/src/routes";

class SearchResultItemComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lastRunStatus: props.result?.last_run?.status,
      lastRunCreatedTime: props.result?.last_run?.created,
    };
  }
  static contextType = NotificationContext;

  onError = (e) => {
    const { addNotification } = this.context;
    addNotification({
      title: i18next.t("Status ") + e.status,
      content: `${e.message}`,
      type: "error",
    });
    console.error(e);
  };

  render() {
    const {
      title,
      actions,
      apiEndpoint,
      idKeyPath,
      listUIEndpoint,
      resourceName,
      displayDelete,
      displayEdit,
      result,
    } = this.props;

    const { lastRunStatus, lastRunCreatedTime } = this.state;

    return (
      <Table.Row>
        <Table.Cell
          key={`job-name-${result.title}`}
          data-label={i18next.t("Name")}
          collapsing
          className="word-break-all"
        >
          <a href={`/administration/jobs/${result.id}`}>{result.title}</a>
        </Table.Cell>
        <Table.Cell
          key={`job-status-${result.active}`}
          data-label={i18next.t("Active")}
          collapsing
          className="word-break-all"
        >
          <BoolFormatter
            tooltip={i18next.t("Inactive")}
            icon="ban"
            color="grey"
            value={result.active === false}
          />
          <BoolFormatter
            tooltip={i18next.t("Active")}
            icon="check"
            color="green"
            value={result.active === true}
          />
        </Table.Cell>
        <Table.Cell
          key={`job-last-run-${result.created}`}
          data-label={i18next.t("Last run")}
          collapsing
          className=""
        >
          {lastRunStatus ? (
            <>
              <StatusFormatter status={lastRunStatus} />
              <Popup
                content={lastRunCreatedTime}
                trigger={
                  <span>
                    {toRelativeTime(lastRunCreatedTime, i18next.language)}
                  </span>
                }
              />
            </>
          ) : (
            "−"
          )}
        </Table.Cell>
        {result?.last_run?.started_by ? (
          <Table.Cell
            key={`job-user-${result.last_run.started_by.id}`}
            data-label={i18next.t("Started by")}
            collapsing
            className="word-break-all"
          >
            <UserListItemCompact
              user={result.last_run.started_by}
              id={result.last_run.started_by.id}
            />
          </Table.Cell>
        ) : (
          <Table.Cell
            key="job-user"
            data-label={i18next.t("Started by")}
            collapsing
            className="word-break-all"
          >
            System
          </Table.Cell>
        )}
        <Table.Cell
          collapsing
          key={`job-next-run${result.next_run}`}
          data-label={i18next.t("Next run")}
          className="word-break-all"
        >
          {result.active === false
            ? "Inactive"
            : toRelativeTime(result.next_run, i18next.language) ?? "−"}
        </Table.Cell>
        <Table.Cell collapsing>
          <Button.Group size="tiny" className="relaxed">
            <RunButton
              jobId={result.id}
              config={result.default_args ?? {}}
              onError={this.onError}
              setRun={(status, created) => {
                this.setState({
                  lastRunStatus: status,
                  lastRunCreatedTime: created,
                });
              }}
            />
            <Actions
              title={title}
              resourceName={resourceName}
              apiEndpoint={apiEndpoint}
              editUrl={AdminUIRoutes.editView(
                listUIEndpoint,
                result,
                idKeyPath
              )}
              actions={actions}
              displayEdit={displayEdit}
              displayDelete={displayDelete}
              resource={result}
              idKeyPath={idKeyPath}
              listUIEndpoint={listUIEndpoint}
            />
          </Button.Group>
        </Table.Cell>
      </Table.Row>
    );
  }
}

SearchResultItemComponent.propTypes = {
  result: PropTypes.object.isRequired,
  idKeyPath: PropTypes.string.isRequired,
  listUIEndpoint: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  resourceName: PropTypes.string.isRequired,
  displayEdit: PropTypes.bool,
  displayDelete: PropTypes.bool,
  actions: PropTypes.object.isRequired,
  apiEndpoint: PropTypes.string.isRequired,
};

SearchResultItemComponent.defaultProps = {};

export const SearchResultItemLayout = withState(SearchResultItemComponent);
