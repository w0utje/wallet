(function () {
    'use strict';

    function MainMenuController($scope, $interval, events, applicationContext,
                                cryptoService, dialogService, notificationService, apiService) {
        var ctrl = this,
            refreshPromise,
            delayRefresh = 10 * 1000;

        ctrl.blockHeight = 0;
        ctrl.address = applicationContext.account.address;
        ctrl.addressQr = 'waves://' + ctrl.address;

        ctrl.ShowSeedState = "Reveal key";

        function initializeBackupFields() {
            ctrl.seed = applicationContext.account.seed;
            ctrl.encodedSeed = cryptoService.base58.encode(converters.stringToByteArray(ctrl.seed));
            ctrl.publicKey = applicationContext.account.keyPair.public;
            ctrl.privateKey = applicationContext.account.keyPair.private;
        }

        function buildBackupClipboardText() {
            var text = 'Seed: ' + ctrl.seed + '\n';
            text += 'Encoded seed: ' + ctrl.encodedSeed + '\n';
            text += 'Private key: ' + ctrl.privateKey + '\n';
            text += 'Public key: ' + ctrl.publicKey + '\n';
            text += 'Address: ' + ctrl.address;
            return text;
        }

        refreshBlockHeight();
        refreshPromise = $interval(refreshBlockHeight, delayRefresh);

        $scope.$on('$destroy', function () {
            if (angular.isDefined(refreshPromise)) {
                $interval.cancel(refreshPromise);
                refreshPromise = undefined;
            }
        });

        ctrl.showAddressQr = showAddressQr;
        ctrl.showBackupDialog = showBackupDialog;
        ctrl.showProfileDialog = showProfileDialog;
        ctrl.backup = backup;

        ctrl.ShowOrHideSeed = ShowOrHideSeed;
        ctrl.showTermsDialog = showTermsDialog;

        function hideSeed(){
          ctrl.seed = "";
          ctrl.encodedSeed = "";
          ctrl.publicKey = "";
          ctrl.privateKey = "";
          ctrl.ShowSeedState = "Reveal key";
          window.clearTimeout(ctrl.currentTimer);
        }

        function ShowOrHideSeed(){
          if(ctrl.ShowSeedState == "Reveal key")
          {
            showSeed();
          } else {
            hideSeed();
          }
        }

        function showSeed() {
          initializeBackupFields();
          ctrl.ShowSeedState = "Hide key";
          ctrl.currentTimer = window.setTimeout(hideSeed, 29000);
        }

        function showAddressQr() {
            dialogService.open('#address-qr-modal');
        }

        function showProfileDialog() {
            $scope.$broadcast(events.NAVIGATION_CREATE_ALIAS, {});
        }

        function showBackupDialog() {
            initializeBackupFields();
            dialogService.open('#header-wPop-backup');
        }

        function showTermsDialog() {
            dialogService.open('#header-wPop-faq');
        }

        function backup() {
            var clipboard = new Clipboard('#backupForm', {
                text: function () {
                    return buildBackupClipboardText();
                }
            });

            clipboard.on('success', function(e) {
                notificationService.notice('Account backup has been copied to clipboard');
                e.clearSelection();
            });

            angular.element('#backupForm').click();
            clipboard.destroy();
        }

        function refreshBlockHeight() {
            apiService.blocks.height().then(function (response) {
                ctrl.blockHeight = response.height;
                applicationContext.blockHeight = response.height;
            });
        }
    }

    MainMenuController.$inject = ['$scope', '$interval', 'navigation.events', 'applicationContext',
                                  'cryptoService', 'dialogService', 'notificationService', 'apiService'];

    angular
        .module('app.navigation')
        .controller('mainMenuController', MainMenuController);
})();
