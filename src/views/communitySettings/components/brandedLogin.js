// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import {
  getCommunityById,
  type GetCommunityType,
} from 'shared/graphql/queries/community/getCommunity';
import { Loading } from 'src/components/loading';
import viewNetworkHandler, {
  type ViewNetworkHandlerType,
} from 'src/components/viewNetworkHandler';
import {
  SectionCard,
  SectionTitle,
  SectionSubtitle,
  SectionCardFooter,
} from 'src/components/settingsViews/style';
import BrandedLoginToggle from './brandedLoginToggle';
import Link from 'src/components/link';
import { Button, OutlineButton } from 'src/components/buttons';
import { TextArea, Error } from 'src/components/formElements';
import saveBrandedLoginSettings from 'shared/graphql/mutations/community/saveBrandedLoginSettings';
import { addToastWithTimeout } from '../../../actions/toasts';

type Props = {
  data: {
    community: GetCommunityType,
  },
  ...$Exact<ViewNetworkHandlerType>,
  saveBrandedLoginSettings: Function,
  dispatch: Function,
};

type State = {
  messageValue: ?string,
  messageLengthError: boolean,
};

class BrandedLogin extends React.Component<Props, State> {
  state = {
    messageValue: null,
    messageLengthError: false,
  };

  componentDidUpdate(prevProps) {
    const curr = this.props;
    if (!prevProps.data.community && curr.data.community) {
      return this.setState({
        messageValue: curr.data.community.brandedLogin.message,
      });
    }
  }

  handleChange = e => {
    return this.setState({
      messageValue: e.target.value,
      messageLengthError: e.target.value.length > 280 ? true : false,
    });
  };

  saveCustomMessage = e => {
    e.preventDefault();
    const { messageValue } = this.state;

    if (messageValue && messageValue.length > 280) {
      return this.setState({
        messageLengthError: true,
      });
    }

    return this.props
      .saveBrandedLoginSettings({
        message: messageValue,
        id: this.props.data.community.id,
      })
      .then(() => {
        this.setState({ messageLengthError: false });
        return this.props.dispatch(addToastWithTimeout('success', 'Saved!'));
      })
      .catch(err => {
        this.setState({ messageLengthError: false });
        return this.props.dispatch(addToastWithTimeout('error', err));
      });
  };

  render() {
    const { data: { community }, isLoading } = this.props;
    const { messageLengthError } = this.state;

    if (community) {
      const { brandedLogin } = community;
      return (
        <SectionCard>
          <SectionTitle>Branded Login</SectionTitle>
          <SectionSubtitle>
            Display a custom login message when people are signing up to
            Spectrum directly from your community’s profile
          </SectionSubtitle>

          <BrandedLoginToggle settings={brandedLogin} id={community.id} />

          <form onSubmit={this.saveCustomMessage}>
            {brandedLogin.isEnabled && (
              <TextArea
                defaultValue={brandedLogin.message}
                placeholder={'Set a custom message for the login screen'}
                onChange={this.handleChange}
              />
            )}

            {messageLengthError && (
              <Error>
                Custom login messages should be under 280 characters.
              </Error>
            )}

            {brandedLogin.isEnabled && (
              <SectionCardFooter
                style={{
                  flexDirection: 'row-reverse',
                  justifyContent: 'flex-start',
                }}
              >
                <Button
                  style={{ alignSelf: 'flex-start' }}
                  onSubmit={this.saveCustomMessage}
                  onClick={this.saveCustomMessage}
                  disabled={messageLengthError}
                >
                  Save
                </Button>

                <Link
                  to={`/${community.slug}/login`}
                  style={{ marginRight: '8px' }}
                >
                  <OutlineButton
                    color={'text.alt'}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    Preview
                  </OutlineButton>
                </Link>
              </SectionCardFooter>
            )}
          </form>
        </SectionCard>
      );
    }

    if (isLoading) {
      return (
        <SectionCard>
          <Loading />
        </SectionCard>
      );
    }

    return null;
  }
}

export default compose(
  getCommunityById,
  viewNetworkHandler,
  saveBrandedLoginSettings,
  connect()
)(BrandedLogin);